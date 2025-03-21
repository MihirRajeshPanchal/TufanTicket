from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    id: str = Field(alias="_id")
    clerkId: str 
    firstName: str
    lastName: str
    username: str
    email: EmailStr
    photo: str
    class Config:
        populate_by_name = True 