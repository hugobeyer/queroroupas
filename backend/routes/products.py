from fastapi import APIRouter, HTTPException
from typing import List
from models import Product, ProductCreate, ProductUpdate
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def setup_product_routes(db: AsyncIOMotorDatabase):
    products_collection = db.products

    @router.get("/products", response_model=List[Product])
    async def get_products():
        try:
            products = await products_collection.find().to_list(1000)
            return [Product(**product) for product in products]
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
            raise HTTPException(status_code=500, detail="Error fetching products")

    @router.post("/products", response_model=Product)
    async def create_product(product_data: ProductCreate):
        try:
            product = Product(**product_data.dict())
            result = await products_collection.insert_one(product.dict())
            if result.inserted_id:
                return product
            raise HTTPException(status_code=500, detail="Failed to create product")
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.put("/products/{product_id}", response_model=Product)
    async def update_product(product_id: str, product_data: ProductUpdate):
        try:
            update_dict = {k: v for k, v in product_data.dict().items() if v is not None}
            
            if not update_dict:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            result = await products_collection.find_one_and_update(
                {"id": product_id},
                {"$set": update_dict},
                return_document=True
            )
            
            if result:
                return Product(**result)
            raise HTTPException(status_code=404, detail="Product not found")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating product: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete("/products/{product_id}")
    async def delete_product(product_id: str):
        try:
            result = await products_collection.delete_one({"id": product_id})
            if result.deleted_count > 0:
                return {"message": "Product deleted successfully"}
            raise HTTPException(status_code=404, detail="Product not found")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting product: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router