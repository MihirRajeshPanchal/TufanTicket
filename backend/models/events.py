from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime

class Organizer(BaseModel):
    _id: str
    firstName: str
    lastName: str

class Category(BaseModel):
    _id: str
    name: str

class Event(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    price: str
    isFree: bool
    imageUrl: str
    location: str
    startDateTime: datetime
    endDateTime: datetime
    url: str
    organizer: str
    category: str
