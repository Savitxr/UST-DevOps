from models import UserDB , PostDB
from database import engine , base ,sessionlocal
from sqlalchemy.orm import Session
from fastapi import FastAPI , Depends ,HTTPException
from pydantic import BaseModel
from typing import Optional ,List
app=FastAPI(title="Blog Management")

base.metadata.create_all(bind=engine)

def get_db():
    db=sessionlocal()
    try:
        yield db
    finally:
        db.close()


class UserCreate(BaseModel):
    name:str


class UserResponse(BaseModel):
    id:int
    name:str
    posts: list["PostResponse"] =[]

    class Config:
        from_attributes=True

class PostCreate(BaseModel):
    title:str
    content:Optional[str]=None

class PostResponse(BaseModel):
    id: int
    title: str
    content: Optional[str]

    class Config:
        from_attributes = True



@app.post("/api/v1/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = UserDB(name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user



@app.post("/api/v1/users/{user_id}/posts", response_model=PostResponse)
def create_post_for_user(user_id: int,post: PostCreate,db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_post = PostDB( title=post.title,content=post.content, user=user)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.get("/api/v1/users/{user_id}", response_model=UserResponse)
def get_user_with_posts(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
