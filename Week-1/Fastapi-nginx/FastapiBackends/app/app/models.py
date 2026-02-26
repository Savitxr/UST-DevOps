from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from .database import Base
from datetime import datetime, UTC

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=0, nullable=False)


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    quantity = Column(Integer, nullable=False)


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    selling_price=Column(Float, nullable=False)

class Account(Base):
    __tablename__ = "account"

    id = Column(Integer, primary_key=True)
    balance = Column(Float, default=0.0, nullable=False)
    initialized = Column(Integer, default=0, nullable=False)
