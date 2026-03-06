from fastapi import APIRouter, Depends, HTTPException

# from . import sale
from .database import SessionLocal, get_db
from .models import Account, Purchase, Product, Sale
from .schemas import AccountInit
from sqlalchemy.orm import Session

router=APIRouter()

@router.post("/account/initialize")
def initialize_account(data: AccountInit, db: Session = Depends(get_db)):
    initial_balance= data.initial_balance
    if initial_balance < 0:
        raise HTTPException(
            status_code=400,
            detail="Initial balance cannot be negative"
        )
    
    account=db.query(Account).first()
    if account and account.initialized == 1:
        raise HTTPException(
            status_code=400,
            detail="Account already initialized"
        )
    if not account:
        account=Account(
            balance=initial_balance,
            initialized=1
        )
        db.add(account)
    else:
        account.balance = initial_balance
        account.initialized = 1
    db.commit()

    return {
        "message": "Account initialized",
        "opening_balance": initial_balance
    }

@router.get("/account/profit-loss")
def profit_loss(db: Session = Depends(get_db)):
    # db=SessionLocal()

    total_spent=0
    total_earned=0

    purchases=db.query(Purchase).all()
    sales=db.query(Sale).all()

    for p in purchases:
        product=db.query(Product).filter(Product.id == p.product_id).first()
        total_spent += product.price * p.quantity
    
    for s in sales:
        product=db.query(Product).filter(Product.id==s.product_id).first()
        total_earned += s.selling_price*s.quantity
    
    return {
        "total spent": total_spent,
        "total earned": total_earned,
        "profit or loss": total_earned - total_spent
    }

@router.get("/account/balance")
def get_balance(db: Session = Depends(get_db)):
    account = db.query(Account).first()
    if not account or account.initialized == 0:
        raise HTTPException(
            status_code=400,
            detail="Account not initialized. Set opening balance first"
        )
    return {"current balance": account.balance}