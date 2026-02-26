from pydantic import BaseModel, Field

class VendorCreate(BaseModel):
    name: str
    phone: str

class VendorPhonePatch(BaseModel):
    phone: str

class ProductCreate(BaseModel):
    name: str
    price: float
    vendor_id: int

class PurchaseCreate(BaseModel):
    product_id: int
    vendor_id: int
    quantity: int

class SaleCreate(BaseModel):
    product_id: int
    quantity: int
    selling_price: float

class AccountInit(BaseModel):
    initial_balance: float