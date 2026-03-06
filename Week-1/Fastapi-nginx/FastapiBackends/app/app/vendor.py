from fastapi import APIRouter, Depends, HTTPException
from .database import SessionLocal, get_db
from .models import Vendor, Product, Inventory, Purchase
import re
from .schemas import VendorCreate, VendorPhonePatch
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/vendors")
def add_vendor(vendor: VendorCreate,db: Session = Depends(get_db)):
    name=vendor.name
    phone=vendor.phone
    if not name.replace(" ", "").isalpha():
        raise HTTPException(
            status_code=400,
            detail="Vendor name must contain only alphabets."
        )
    if not phone.isdigit() or len(phone) != 10 or phone.startswith("0"):
        raise HTTPException(
            status_code=400,
            detail="Phone number must be 10 digits and not starting with 0"
        )
    # db = SessionLocal()
    vendor = Vendor(name=name, phone=phone)
    db.add(vendor)
    db.commit()
    return {"message": "Vendor added"}

@router.get("/vendors")
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()

@router.delete("/vendors/{vendor_id}")
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor=db.query(Vendor).filter(Vendor.id==vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    products=db.query(Product).filter(Product.vendor_id == vendor_id).all()

    for product in products:
        db.query(Inventory).filter(
            Inventory.product_id == product.id
        ).delete()
        db.query(Purchase).filter(
            Purchase.product_id==product.id
        ).delete()
        db.delete(product)
    
    db.delete(vendor)
    db.commit()
    return {"message": "Vendor and associated data deletion successful."}

@router.patch("/vendors/{vendor_id}/phone")
def update_vendor_phone(vendor_id: int, data: VendorPhonePatch, db: Session = Depends(get_db)):
    vendor=db.query(Vendor).filter(
        Vendor.id==vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )
    if not data.phone.isdigit() or data.phone.startswith("0"):
        raise HTTPException(
            status_code=400,
            detail="Invalid phone number"
        )
    vendor.phone=data.phone
    db.commit()
    return{
        "message": "Vendor phone number updated successfully",
        "vendor_id": vendor_id,
        "new_phone": data.phone
    }