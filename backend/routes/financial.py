from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
from models_financial import (
    Sale, SaleCreate, Installment, CashFlowEntry, CashFlowEntryCreate,
    MonthlyReport, PaymentMethod, SaleStatus
)
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
import calendar

logger = logging.getLogger(__name__)
router = APIRouter()

def setup_financial_routes(db: AsyncIOMotorDatabase):
    sales_collection = db.sales
    installments_collection = db.installments
    cash_flow_collection = db.cash_flow
    products_collection = db.products

    # ==================== SALES ====================
    
    @router.post("/sales", response_model=Sale)
    async def create_sale(sale_data: SaleCreate):
        try:
            # Calculate totals
            subtotal = sum(item.total for item in sale_data.items)
            total = subtotal - sale_data.discount
            
            sale = Sale(
                **sale_data.dict(),
                subtotal=subtotal,
                total=total
            )
            
            # Create sale
            await sales_collection.insert_one(sale.dict())
            
            # Create installments
            if sale.installments_count > 1:
                installment_amount = total / sale.installments_count
                for i in range(sale.installments_count):
                    due_date = datetime.now().date() + timedelta(days=30 * (i + 1))
                    installment = Installment(
                        sale_id=sale.id,
                        number=i + 1,
                        due_date=due_date,
                        amount=installment_amount
                    )
                    await installments_collection.insert_one(installment.dict())
            else:
                # Single payment
                installment = Installment(
                    sale_id=sale.id,
                    number=1,
                    due_date=datetime.now().date(),
                    amount=total,
                    paid=True,
                    paid_date=datetime.now().date()
                )
                await installments_collection.insert_one(installment.dict())
            
            # Update stock
            for item in sale_data.items:
                await products_collection.update_one(
                    {"id": item.product_id},
                    {"$inc": {"stock_quantity": -item.quantity}}
                )
            
            # Create cash flow entry for sale
            cash_entry = CashFlowEntry(
                type="Entrada",
                category="Venda",
                description=f"Venda #{sale.id[:8]}",
                amount=total,
                reference_id=sale.id
            )
            await cash_flow_collection.insert_one(cash_entry.dict())
            
            return sale
        except Exception as e:
            logger.error(f"Error creating sale: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/sales", response_model=List[Sale])
    async def get_sales(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status: Optional[SaleStatus] = None
    ):
        try:
            query = {}
            
            if start_date or end_date:
                date_query = {}
                if start_date:
                    date_query["$gte"] = datetime.fromisoformat(start_date)
                if end_date:
                    date_query["$lte"] = datetime.fromisoformat(end_date)
                query["date"] = date_query
            
            if status:
                query["status"] = status
            
            sales = await sales_collection.find(query).sort("date", -1).to_list(1000)
            return [Sale(**sale) for sale in sales]
        except Exception as e:
            logger.error(f"Error fetching sales: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/sales/{sale_id}", response_model=Sale)
    async def get_sale(sale_id: str):
        try:
            sale = await sales_collection.find_one({"id": sale_id})
            if not sale:
                raise HTTPException(status_code=404, detail="Sale not found")
            return Sale(**sale)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching sale: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # ==================== INSTALLMENTS ====================
    
    @router.get("/installments", response_model=List[Installment])
    async def get_installments(
        paid: Optional[bool] = None,
        month: Optional[int] = None,
        year: Optional[int] = None
    ):
        try:
            query = {}
            
            if paid is not None:
                query["paid"] = paid
            
            if month and year:
                start_date = date(year, month, 1)
                last_day = calendar.monthrange(year, month)[1]
                end_date = date(year, month, last_day)
                query["due_date"] = {"$gte": start_date, "$lte": end_date}
            
            installments = await installments_collection.find(query).sort("due_date", 1).to_list(1000)
            return [Installment(**inst) for inst in installments]
        except Exception as e:
            logger.error(f"Error fetching installments: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.put("/installments/{installment_id}/pay")
    async def pay_installment(installment_id: str):
        try:
            result = await installments_collection.find_one_and_update(
                {"id": installment_id},
                {
                    "$set": {
                        "paid": True,
                        "paid_date": datetime.now().date()
                    }
                },
                return_document=True
            )
            
            if not result:
                raise HTTPException(status_code=404, detail="Installment not found")
            
            # Check if all installments of the sale are paid
            sale_id = result["sale_id"]
            all_installments = await installments_collection.find({"sale_id": sale_id}).to_list(100)
            all_paid = all([inst["paid"] for inst in all_installments])
            
            if all_paid:
                await sales_collection.update_one(
                    {"id": sale_id},
                    {"$set": {"status": SaleStatus.PAID}}
                )
            else:
                await sales_collection.update_one(
                    {"id": sale_id},
                    {"$set": {"status": SaleStatus.PARTIAL}}
                )
            
            return Installment(**result)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error paying installment: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # ==================== CASH FLOW ====================
    
    @router.post("/cash-flow", response_model=CashFlowEntry)
    async def create_cash_flow_entry(entry_data: CashFlowEntryCreate):
        try:
            entry = CashFlowEntry(**entry_data.dict())
            await cash_flow_collection.insert_one(entry.dict())
            return entry
        except Exception as e:
            logger.error(f"Error creating cash flow entry: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/cash-flow", response_model=List[CashFlowEntry])
    async def get_cash_flow(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        type: Optional[str] = None
    ):
        try:
            query = {}
            
            if start_date or end_date:
                date_query = {}
                if start_date:
                    date_query["$gte"] = datetime.fromisoformat(start_date)
                if end_date:
                    date_query["$lte"] = datetime.fromisoformat(end_date)
                query["date"] = date_query
            
            if type:
                query["type"] = type
            
            entries = await cash_flow_collection.find(query).sort("date", -1).to_list(1000)
            return [CashFlowEntry(**entry) for entry in entries]
        except Exception as e:
            logger.error(f"Error fetching cash flow: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete("/cash-flow/{entry_id}")
    async def delete_cash_flow_entry(entry_id: str):
        try:
            result = await cash_flow_collection.delete_one({"id": entry_id})
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Entry not found")
            return {"message": "Entry deleted"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting cash flow entry: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # ==================== DASHBOARD / REPORTS ====================
    
    @router.get("/dashboard/summary")
    async def get_dashboard_summary():
        try:
            now = datetime.now()
            month_start = datetime(now.year, now.month, 1)
            
            # Total sales this month
            sales = await sales_collection.find({"date": {"$gte": month_start}}).to_list(1000)
            total_sales_gross = sum(sale["total"] for sale in sales)
            sales_count = len(sales)
            
            # Pending receivables
            pending_installments = await installments_collection.find({"paid": False}).to_list(1000)
            pending_amount = sum(inst["amount"] for inst in pending_installments)
            
            # Cash flow balance
            cash_entries = await cash_flow_collection.find({"date": {"$gte": month_start}}).to_list(1000)
            total_income = sum(e["amount"] for e in cash_entries if e["type"] == "Entrada")
            total_expense = sum(e["amount"] for e in cash_entries if e["type"] == "Saída")
            balance = total_income - total_expense
            
            # Stock value
            products = await products_collection.find().to_list(1000)
            stock_value = sum(p.get("stock_quantity", 0) * p.get("price", 0) for p in products)
            
            return {
                "total_sales_gross": total_sales_gross,
                "sales_count": sales_count,
                "pending_receivables": pending_amount,
                "cash_balance": balance,
                "total_income": total_income,
                "total_expense": total_expense,
                "stock_value": stock_value
            }
        except Exception as e:
            logger.error(f"Error fetching dashboard summary: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/reports/monthly")
    async def get_monthly_report(month: int, year: int):
        try:
            start_date = datetime(year, month, 1)
            last_day = calendar.monthrange(year, month)[1]
            end_date = datetime(year, month, last_day, 23, 59, 59)
            
            # Sales
            sales = await sales_collection.find({
                "date": {"$gte": start_date, "$lte": end_date}
            }).to_list(1000)
            
            total_sales_gross = sum(sale["total"] for sale in sales)
            sales_count = len(sales)
            average_ticket = total_sales_gross / sales_count if sales_count > 0 else 0
            
            # Fees (estimated 5%)
            total_fees = total_sales_gross * 0.05
            total_received_net = total_sales_gross - total_fees
            
            # Top products
            product_sales = {}
            for sale in sales:
                for item in sale["items"]:
                    pid = item["product_id"]
                    if pid not in product_sales:
                        product_sales[pid] = {
                            "name": item["product_name"],
                            "quantity": 0,
                            "revenue": 0
                        }
                    product_sales[pid]["quantity"] += item["quantity"]
                    product_sales[pid]["revenue"] += item["total"]
            
            top_products = sorted(
                product_sales.values(),
                key=lambda x: x["revenue"],
                reverse=True
            )[:5]
            
            # Pending receivables
            pending_installments = await installments_collection.find({
                "paid": False,
                "due_date": {"$gte": start_date.date(), "$lte": end_date.date()}
            }).to_list(1000)
            pending_receivables = sum(inst["amount"] for inst in pending_installments)
            
            # Stock value
            products = await products_collection.find().to_list(1000)
            stock_value = sum(p.get("stock_quantity", 0) * p.get("price", 0) for p in products)
            
            # Profit (simplified - sales - expenses)
            expenses = await cash_flow_collection.find({
                "type": "Saída",
                "date": {"$gte": start_date, "$lte": end_date}
            }).to_list(1000)
            total_expenses = sum(exp["amount"] for exp in expenses)
            real_profit = total_received_net - total_expenses
            
            return {
                "month": calendar.month_name[month],
                "year": year,
                "total_sales_gross": total_sales_gross,
                "total_fees": total_fees,
                "total_received_net": total_received_net,
                "real_profit": real_profit,
                "total_sales_count": sales_count,
                "average_ticket": average_ticket,
                "top_products": top_products,
                "pending_receivables": pending_receivables,
                "stock_value": stock_value
            }
        except Exception as e:
            logger.error(f"Error generating monthly report: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router
