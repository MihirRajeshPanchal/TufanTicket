from backend.models.events import Event
from backend.models.user import User
from backend.constants.tufan import mongo_client, driver
from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.services.graph import (
    add_all_comments_to_graph,
    add_event_to_graph,
    add_organizer_to_graph,
    add_attendee_to_graph,
    add_category_to_graph, 
    create_attends_relationship,
    remove_user_nodes
)
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from backend.utils.serialization import convert_objectid_to_str  
import asyncio

router = APIRouter()

@router.post("/add_organizers_to_graph")
async def organizers_endpoint():
    
    event_data = mongo_client.read_all("events")
    organizer_ids = set()
    
    
    for event_dict in event_data:
        if "organizer" in event_dict and event_dict["organizer"]:
            organizer_ids.add(str(event_dict["organizer"]))
    
    
    organizer_count = 0
    for organizer_id in organizer_ids:
        user_dict = mongo_client.read("users", organizer_id)
        if user_dict:
            user = User(
                _id=user_dict["_id"],
                clerkId=user_dict.get("clerkId"),
                firstName=user_dict.get("firstName"),
                lastName=user_dict.get("lastName"),
                username=user_dict.get("username"),
                email=user_dict.get("email"),
                photo=user_dict.get("photo")
            )
            add_organizer_to_graph(user)
            organizer_count += 1
    
    response_data = {"message": f"Added {organizer_count} organizers to the graph database"}
    return response_data

@router.post("/add_attendees_to_graph")
async def attendees_endpoint():
    
    order_data = mongo_client.read_all("orders")
    attendee_ids = set()
    
    
    for order in order_data:
        if "buyer" in order and order["buyer"]:
            attendee_ids.add(str(order["buyer"]))
    
    
    attendee_count = 0
    for attendee_id in attendee_ids:
        user_dict = mongo_client.read("users", attendee_id)
        if user_dict:
            user = User(
                _id=user_dict["_id"],
                clerkId=user_dict.get("clerkId"),
                firstName=user_dict.get("firstName"),
                lastName=user_dict.get("lastName"),
                username=user_dict.get("username"),
                email=user_dict.get("email"),
                photo=user_dict.get("photo")
            )
            add_attendee_to_graph(user)
            attendee_count += 1
    
    response_data = {"message": f"Added {attendee_count} attendees to the graph database"}
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

@router.post("/add_order_relationships")
async def order_relationships_endpoint():
    order_data = mongo_client.read_all("orders")
     
    relationship_count = 0
    for order in order_data:
        if "buyer" in order and "event" in order:
            user_id = str(order["buyer"])
            event_id = str(order["event"])
            
            create_attends_relationship(user_id, event_id)
            relationship_count += 1
    
    response_data = {"message": f"Created {relationship_count} ATTENDS relationships", "orders_processed": len(order_data)}
    return response_data

@router.post("/remove_user_nodes")
async def remove_user_nodes_endpoint():
    """Removes any existing User nodes from the graph."""
    try:
        remove_user_nodes()
        return {"message": "Successfully removed all User nodes from the graph"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove User nodes: {str(e)}")

@router.post("/add_comments_to_graph")
async def comments_endpoint():
    """Add all comments from MongoDB to the graph database"""
    try:
        comment_count = add_all_comments_to_graph()
        return {"message": f"Added {comment_count} comments to the graph database"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add comments to graph: {str(e)}")

async def build_full_graph_task():
    """Background task to build the full graph by calling all APIs in sequence."""
    try:
        await remove_user_nodes_endpoint()
        await events_endpoint()
        await organizers_endpoint()
        await attendees_endpoint()
        await order_relationships_endpoint()
        await comments_endpoint()
        print("Full graph build completed successfully")
    except Exception as e:
        print(f"Error building full graph: {str(e)}")

@router.post("/build_full_graph")
async def build_full_graph(background_tasks: BackgroundTasks):
    """Aggregator API that builds the full graph by calling all other APIs in sequence."""
    try:
        
        background_tasks.add_task(build_full_graph_task)
        return {"message": "Full graph build process started in the background"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start graph build: {str(e)}")