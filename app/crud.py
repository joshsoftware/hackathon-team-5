# app/crud.py
from sqlalchemy.orm import Session
from models import DbItem
from schemas import Item

def create_item(db: Session, item: Item):
    db_item = DbItem(
        name=item.name,
        description="; ".join(item.description),  # Combine list into a single string
        price=item.price
    )
    db.add(db_item)  # Add the item to the session
    db.commit()  # Commit to the database
    db.refresh(db_item)  # Refresh to get the updated record
    return db_item
