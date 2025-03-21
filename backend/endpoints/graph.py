from backend.models.events import Event
from backend.models.user import User
from backend.constants.tufan import mongo_client, driver
from fastapi import APIRouter, HTTPException
from backend.services.graph import add_event_to_graph, add_user_to_graph, add_category_to_graph
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from backend.utils.serialization import convert_objectid_to_str  

router = APIRouter()

@router.post("/add_users_to_graph")
async def users_endpoint():
    user_data = mongo_client.read_all("users")
    
    for user_dict in user_data:
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
    
    
    response_data = {"message": f"Added {len(user_data)} users to the graph database", "users": user_data}
    return response_data  

@router.post("/add_events_to_graph")
async def events_endpoint():
    event_data = mongo_client.read_all("events")
    
    for event_dict in event_data:
        event = Event(
            id=event_dict["_id"],
            title=event_dict["title"],
            description=event_dict.get("description"),
            location=event_dict.get("location"),
            imageUrl=event_dict.get("imageUrl"),
            startDateTime=event_dict["startDateTime"],
            endDateTime=event_dict["endDateTime"],
            isFree=event_dict["isFree"],
            url=event_dict.get("url"),
            categoryId=event_dict.get("category"),
            organizerId=event_dict.get("organizer")
        )

        add_event_to_graph(event)
        if event.categoryId:
            
            category_id = ObjectId(event.categoryId) if isinstance(event.categoryId, str) else event.categoryId
            category = mongo_client.find_one("categories", {"_id": category_id})
            if category:
                add_category_to_graph(event.id, category["_id"], category["name"]) 
    
    
    response_data = {"message": f"Added {len(event_data)} events to the graph database", "events": event_data}
    return response_data  