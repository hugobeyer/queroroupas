from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import uuid
from enum import Enum

class PaymentMethod(str, Enum):
    PIX = "PIX"
    DEBIT = "Débito"
    CREDIT_1X = "Crédito 1x"
    CREDIT_2X = "Crédito 2x"
    CREDIT_3X = "Crédito 3x"
    CREDIT_6X = "Crédito 6x"
    CREDIT_12X = "Crédito 12x"
    BOLETO = "Boleto"

class SaleStatus(str, Enum):
    PENDING = "Pendente"
    PAID = "Paga"
    PARTIAL = "Parcial"
    CANCELLED = "Cancelada"

# Sale Item
class SaleItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total: float

# Installment (Parcela)
class Installment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sale_id: str
    number: int
    due_date: date
    amount: float
    paid: bool = False
    paid_date: Optional[date] = None

# Sale
class Sale(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime = Field(default_factory=datetime.utcnow)
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    items: List[SaleItem]
    subtotal: float
    discount: float = 0
    total: float
    payment_method: PaymentMethod
    installments_count: int = 1
    status: SaleStatus = SaleStatus.PENDING
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class SaleCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    items: List[SaleItem]
    discount: float = 0
    payment_method: PaymentMethod
    installments_count: int = 1
    notes: Optional[str] = None

# Cash Flow Entry (Entrada/Saída)
class CashFlowType(str, Enum):
    INCOME = "Entrada"
    EXPENSE = "Saída"

class CashFlowCategory(str, Enum):
    SALE = "Venda"
    INVENTORY = "Compra de Estoque"
    EXPENSE = "Despesa"
    OTHER = "Outro"

class CashFlowEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime = Field(default_factory=datetime.utcnow)
    type: CashFlowType
    category: CashFlowCategory
    description: str
    amount: float
    reference_id: Optional[str] = None  # Link to sale or other entity
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class CashFlowEntryCreate(BaseModel):
    date: Optional[datetime] = None
    type: CashFlowType
    category: CashFlowCategory
    description: str
    amount: float

# Product with Pricing
class ProductPricing(BaseModel):
    cost_price: float = 0
    markup_percentage: float = 100  # 100% = 2x
    tax_percentage: float = 0  # Taxas (Ex: 5%)
    final_price: float = 0

class ProductWithStock(BaseModel):
    id: str
    name: str
    price: float
    image: str
    category: str
    isNew: bool
    stock_quantity: int = 0
    pricing: Optional[ProductPricing] = None
    createdAt: datetime

# Report Models
class MonthlyReport(BaseModel):
    month: str
    year: int
    total_sales_gross: float
    total_fees: float
    total_received_net: float
    real_profit: float
    total_sales_count: int
    average_ticket: float
    top_products: List[dict]
    pending_receivables: float
    stock_value: float
