from backend.models.user import User
from backend.constants.tufan import mongo_client
from fastapi import APIRouter

router = APIRouter()

@router.post("/get_users")
async def get_users_endpoint():
    company_data  = mongo_client.read_all("users")
    return company_data