from fastapi import APIRouter, Depends
from .database import SessionLocal, get_db
from .models import Inventory
from sqlalchemy.orm import Session

router=APIRouter()

@router.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).all()
