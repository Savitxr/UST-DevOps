from fastapi import APIRouter, Depends
from .database import SessionLocal, get_db
from .models import Inventory
from sqlalchemy.orm import Session

router=APIRouter()

@router.get("/reportl/low-stock")
def low_stock(db: Session = Depends(get_db)):
    return db.query(Inventory).filter(Inventory.quantity<10).all()