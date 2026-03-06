from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal, get_db
from .models import Sale, Inventory, Account, Product
from .schemas import SaleCreate
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/sale")
def sell_product(sale: SaleCreate, db: Session = Depends(get_db)):
    product_id=sale.product_id
    quantity=sale.quantity

    # 🔹 Quantity validation
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Sale quantity must be greater than 0"
        )

    # db = SessionLocal()

    # 🔹 Account validation
    account = db.query(Account).first()
    if not account or account.initialized == 0:
        raise HTTPException(
            status_code=400,
            detail="Account not initialized. Set opening balance first"
        )

    # 🔹 Product validation
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # 🔹 Inventory validation
    inventory = db.query(Inventory).filter(
        Inventory.product_id == product_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found"
        )

    # 🔹 Stock check
    if inventory.quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )
    
    account=db.query(Account).first()
    if not account or account.initialized==0:
        raise HTTPException(
            status_code=400,
            detail="Account not initialized"
        )
    
    cost_price=product.price
    selling_price=sale.selling_price
    quantity=sale.quantity

    revenue=selling_price*quantity
    profit = (selling_price-cost_price)*quantity

    # 🔹 Record sale
    sale_entry = Sale(
        product_id=product_id,
        quantity=quantity,
        selling_price=selling_price
    )
    db.add(sale_entry)

    # 🔹 Update inventory
    inventory.quantity -= quantity
    account.balance += revenue

    db.commit()

    return {
        "message": "Sale completed successfully",
        "product_name": product.name,
        "product_id": product_id,
        "quantity_sold": quantity,
        "cost_price": cost_price,
        "selling_price": selling_price,
        "profit on sale": profit,
        "amount_received": revenue,
        "current_balance": account.balance
    }

@router.get("/sale")
def get_sales(db: Session = Depends(get_db)):
    return db.query(Sale).all()
