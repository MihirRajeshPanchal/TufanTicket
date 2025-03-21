import requests
import json
from datetime import datetime, timedelta, timezone
import random
from pymongo import MongoClient
from bson import ObjectId

def fetch_event_data():
    url = "https://www.eventbrite.com/api/v3/destination/events/?event_ids=1271883801689,1274995177899,1262080539869,1255448844289,1255455052859,1288169171669,1288226071859,1254393337239,1257992953789,1292384720489,1254462674629,1255416597839,693039488767,1275048025969,1244833272829,1002287257167,1288260304249,1027627961897,1263660425349,1291203527509&page_size=20&expand=event_sales_status,image,primary_venue,saves,ticket_availability,primary_organizer,public_collections"
           
    response = requests.get(url)
    response.raise_for_status()  # Raise an error for bad responses
    
    # Use the exact ObjectIds from the image
    users = ["67dc67bffa159f4d4f260fc0", "67dc6764b1c51f7d82d07392"]  # Using the organizer ObjectId from the image
    
    events = response.json().get("events", [])
    
    return [
        {
            "_id": ObjectId(),  # Generate a new ObjectId for each document
            "title": event.get("name", "").title(),
            "description": event.get("summary", ""),
            "location": event.get("primary_venue", {}).get("address", {}).get("localized_address_display", ""),
            "imageUrl": event.get("image", {}).get("original", {}).get("url", ""),
            # Use datetime objects which PyMongo will convert to MongoDB Date objects
            "startDateTime": datetime.now(timezone.utc) + timedelta(days=random.randint(1, 30)),  # Random future date
            "endDateTime": datetime.now(timezone.utc) + timedelta(days=random.randint(1, 30) + 5),  # Start date + 5 days
            "price": "",  # Empty string as shown in the image
            "isFree": True,  # Set to true as shown in the image
            "url": event.get("website_url", "http://localhost:300"),  # Default URL if none provided
            "category": ObjectId(
                MongoClient("mongodb+srv://jainambarbhaya1509:rulndXp47fBmU521@recursivedepression.r7xxw.mongodb.net/")["evently"]["categories"]
                .find_one_and_update(
                    {"name": event.get("tags", [{}])[1].get("localized", {}).get("display_name", "")} 
                    if len(event.get("tags", [])) > 1 else {"name": "Unknown"},  # Safe check for index error
                    {"$setOnInsert": {"createdAt": datetime.now(timezone.utc)}},
                    upsert=True,
                    return_document=True
                )["_id"]
            ),
            "organizer": ObjectId(random.choice(users)),
            "createdAt": datetime.now(timezone.utc),  # Use timezone-aware UTC datetime
            "__v": 0  # Version field as shown in the image
        }
        for event in events
    ]

def insert_to_mongodb(data):
    client = MongoClient("mongodb+srv://jainambarbhaya1509:rulndXp47fBmU521@recursivedepression.r7xxw.mongodb.net/")  # Replace with your MongoDB connection string
    db = client["evently"]  # Replace with your database name
    collection = db["events"]  # Replace with your collection name
    result = collection.insert_many(data)
    print(f"Inserted {len(result.inserted_ids)} documents into MongoDB.")

if __name__ == "__main__":
    try:
        event_data = fetch_event_data()
        insert_to_mongodb(event_data)
        print("Event data has been inserted into MongoDB.")
    except Exception as e:
        print(f"Error: {e}")
