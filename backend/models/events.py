from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Event(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    imageUrl: Optional[str] = None
    startDateTime: datetime
    endDateTime: datetime
    isFree: bool
    url: Optional[str] = None
    categoryId: Optional[str] = None
    organizerId: Optional[str] = None
