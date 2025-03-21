from backend.models.events import Category, Event, Organizer
from backend.models.user import User
from backend.constants.tufan import mongo_client
from fastapi import APIRouter, HTTPException
from backend.services.graph import add_user_to_graph
from bson import ObjectId

router = APIRouter()

@router.post("/add_users_to_graph")
async def users_endpoint():
    user_data = mongo_client.read_all("users")
    
    for user_dict in user_data:
        user_dict["_id"] = str(user_dict["_id"])

        user = User(
            _id=user_dict["_id"],  
            clerkId=user_dict.get("clerkId"),
            firstName=user_dict.get("firstName"),
            lastName=user_dict.get("lastName"),
            username=user_dict.get("username"),
            email=user_dict.get("email"),
            photo=user_dict.get("photo")
        )
        
        add_user_to_graph(user)
    
    return {"message": f"Added {len(user_data)} users to the graph database", "users": user_data}