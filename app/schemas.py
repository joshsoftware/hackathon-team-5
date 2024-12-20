# app/schemas.py
from pydantic import BaseModel
from typing import List


class Item(BaseModel):
    name: str
    description: List[str]  # Description as an array of strings
    price: float

    class Config:
        orm_mode = True  # Tells Pydantic to work with SQLAlchemy models
