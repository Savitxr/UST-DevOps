from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal, get_db
from .models import Purchase, Inventory, Account, Product, Vendor
from .schemas import PurchaseCreate
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/purchase")
def get_purchases(db: Session = Depends(get_db)):
    # db = SessionLocal()
    return db.query(Purchase).all()

@router.post("/purchase")
def purchase_product(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    product_id = purchase.product_id
    vendor_id = purchase.vendor_id
    quantity=purchase.quantity

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Purchase quantity must be greater than 0"
        )

    db = SessionLocal()

    account = db.query(Account).first()
    if not account or account.initialized == 0:
        raise HTTPException(
            status_code=400,
            detail="Account not initialized. Set opening balance first"
        )

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    inventory = db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found"
        )

    purchase = Purchase(
        product_id=product_id,
        vendor_id=vendor_id,
        quantity=quantity
    )
    db.add(purchase)

    inventory.quantity += quantity

    total_cost = product.price * quantity
    account.balance -= total_cost

    db.commit()

    return {
        "message": "Purchase recorded successfully",
        "amount_spent": total_cost,
        "current_balance": account.balance
    }
