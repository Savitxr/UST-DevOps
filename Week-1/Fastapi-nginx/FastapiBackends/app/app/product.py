from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal, get_db
from .models import Product, Inventory, Purchase, Vendor, Sale
from .schemas import ProductCreate
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/products")
def add_product(product: ProductCreate,db: Session = Depends(get_db)):
    name=product.name
    price = product.price
    vendor_id = product.vendor_id
    if price <= 0:
        raise HTTPException(
            status_code=400,
            detail="Product price must be greater than 0"
        )

    # db = SessionLocal()

    # 🔹 Check vendor exists
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    product = Product(name=name, price=price, vendor_id=vendor_id)
    db.add(product)
    db.commit()
    db.refresh(product)  # 🔹 ensures product.id is available

    inventory = Inventory(product_id=product.id, quantity=0)
    db.add(inventory)
    db.commit()

    return {"message": "Product added successfully"}


@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    # db = SessionLocal()

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).delete()

    db.query(Purchase).filter(
        Purchase.product_id == product_id
    ).delete()

    db.query(Sale).filter(
        Sale.product_id == product_id
    ).delete()

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}
