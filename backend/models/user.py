from pydantic import BaseModel, EmailStr

class User(BaseModel):
    clerk_id: str
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    photo: str