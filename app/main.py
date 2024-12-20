from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import Item
from app import crud


app = FastAPI()

origins = [
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLAlchemy Setup
DATABASE_URL = "postgresql://user:password@localhost/dbname"

# Create the SQLAlchemy engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Define the SQLAlchemy model that will represent the 'items' table
class DbItem(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Integer)

# Create the database tables if they do not exist
Base.metadata.create_all(bind=engine)

class Item(BaseModel):
    action_type: str
    url: str
    console_error: List[str]
    network_error: List[str]


# Dependency to get the SQLAlchemy session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"Hello": "World"}


# @app.post("/process_logs")
# async def process_logs(items: List[Item],  db: Session = Depends(get_db)):
#     try:
#         # Iterate through each item and save it to the database
#         for item in items:
#             # Create a DbItem object from the Pydantic Item
#             db_item = DbItem(
#                 name=item.name,
#                 description="; ".join(item.description),  # Joining list of descriptions into a single string
#                 price=item.price
#             )
#             db.add(db_item)  # Add item to the session
#         db.commit()  # Commit changes to the database
#         return {"status": "file saved"}
#     except Exception as e:
#         db.rollback()  # Rollback in case of an error
#         raise HTTPException(status_code=500, detail=f"Error saving to database: {str(e)}")


@app.post("/process_logs")
async def process_logs(items: List[Item], db: Session = Depends(get_db)):
    try:
        for item in items:
            crud.create_item(db, item)  # Save each item to the database
        return {"status": "file saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/process_log_file")
async def process_log_file(logs: str = ""):
    return {"OK"}