from fastapi import Depends, FastAPI, HTTPException
from .database import engine, SessionLocal, get_db
from . import models
from .vendor import router as vendor_router
from .product import router as product_router
from .purchase import router as purchase_router
from .report import router as report_router
from .inventory import router as inventory_router
from .sale import router as sale_router
from .account import router as account_router
from .models import Vendor, Product, Inventory, Purchase, Sale, Account
import os
import json
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

app = FastAPI(title="Inventory Management System")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Inventory System Running"}

# Routers
app.include_router(account_router)
app.include_router(vendor_router)
app.include_router(product_router)
app.include_router(purchase_router)
app.include_router(report_router)
app.include_router(inventory_router)
app.include_router(sale_router)

# Backup file path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP_FILE = os.path.join(BASE_DIR, "backup", "backup.json")


@app.post("/backup")
def backup_data(db: Session = Depends(get_db)):

    data = {
        "vendors": [
            {"id": v.id, "name": v.name, "phone": v.phone}
            for v in db.query(Vendor).all()
        ],
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "vendor_id": p.vendor_id
            }
            for p in db.query(Product).all()
        ],
        "inventory": [
            {
                "product_id": i.product_id,
                "quantity": i.quantity
            }
            for i in db.query(Inventory).all()
        ],
        "purchases": [
            {
                "product_id": pr.product_id,
                "vendor_id": pr.vendor_id,
                "quantity": pr.quantity
            }
            for pr in db.query(Purchase).all()
        ],
        "sales": [
            {
                "product_id": s.product_id,
                "quantity": s.quantity,
                "selling_price": s.selling_price
            }
            for s in db.query(Sale).all()
        ],
        "account": [
            {
                "balance": a.balance,
                "initialized": a.initialized
            }
            for a in db.query(Account).all()
        ]
    }

    os.makedirs(os.path.dirname(BACKUP_FILE), exist_ok=True)

    with open(BACKUP_FILE, "w") as f:
        json.dump(data, f, indent=4)

    return {"message": "Backup created successfully"}


@app.post("/restore")
def restore_data(db: Session = Depends(get_db)):
    if not os.path.exists(BACKUP_FILE):
        raise HTTPException(
            status_code=400,
            detail="Backup file not found. Run /backup first."
        )

    # db = SessionLocal()

    with open(BACKUP_FILE, "r") as f:
        data = json.load(f)

    db.query(Vendor).delete()
    db.query(Product).delete()
    db.query(Inventory).delete()
    db.query(Purchase).delete()
    db.query(Sale).delete()
    db.query(Account).delete()
    db.commit()

    for v in data["vendors"]:
        db.add(Vendor(**v))

    for p in data["products"]:
        db.add(Product(**p))

    for i in data["inventory"]:
        db.add(Inventory(**i))

    for pr in data["purchases"]:
        db.add(Purchase(**pr))

    for s in data["sales"]:
        db.add(Sale(**s))

    for a in data["account"]:
        db.add(Account(**a))

    db.commit()

    return {"message": "Data restoration successful"}