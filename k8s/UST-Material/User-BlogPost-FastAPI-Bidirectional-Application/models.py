from sqlalchemy import String , Integer , Column ,ForeignKey
from database import base
from sqlalchemy.orm import relationship 

class UserDB(base):
    __tablename__="users"
    id= Column(Integer , primary_key=True , autoincrement= True)
    name= Column(String , nullable=False)
    posts=relationship("PostDB",back_populates="user" , cascade="all, delete")

class PostDB(base):
    __tablename__="posts"
    id=Column(Integer , primary_key=True , autoincrement= True)
    title=Column(String , nullable=False)
    content=Column(String)
    user_id=Column(Integer, ForeignKey("users.id"), nullable=False)
    user =relationship("UserDB" , back_populates="posts")