import requests
import json
import re
import random
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from bson import ObjectId


MONGO_URI = "mongodb+srv://jainambarbhaya1509:rulndXp47fBmU521@recursivedepression.r7xxw.mongodb.net/"
DB_NAME = "evently"
EVENT_COLLECTION = "events"
CATEGORY_COLLECTION = "categories"


EVENTBRITE_URLS = [
    "https://www.eventbrite.com/api/v3/destination/events/?event_ids=1271883801689,1274995177899,1262080539869,1255448844289,1255455052859,1288169171669,1288226071859,1254393337239,1257992953789,1292384720489,1254462674629,1255416597839,693039488767,1275048025969,1244833272829,1002287257167,1288260304249,1027627961897,1263660425349,1291203527509&page_size=20&expand=event_sales_status,image,primary_venue,saves,ticket_availability,primary_organizer,public_collections",
    "https://www.eventbrite.com/api/v3/destination/events/?event_ids=1230134969809,1007895250827,1270203215009,1223774104289,1225315655109,63049080497,1242020880889,1115852287229&expand=event_sales_status,image,primary_venue,saves,ticket_availability,primary_organizer,public_collections&page_size=50&include_parent_events=true",
    "https://www.eventbrite.com/api/v3/destination/events/?event_ids=1122157827269,1255437991829,1277766356569&page_size=3&expand=event_sales_status,image,primary_venue,saves,ticket_availability,primary_organizer,public_collections",
]
USERS = ["67dd22dd0125c7012a89ea0f", "67dd23480125c7012a89ea16","67dd250e0125c7012a89ea1a", "67dd2a6f20d83ab55206f66d"]


def format_url(name):
    """Generate a URL-friendly string from an event name."""
    name = re.sub(r'[^a-zA-Z0-9]', '-', name)  
    name = re.sub(r'-+', '-', name).strip('-')  
    return f"http://{name.lower()}.com"


def fetch_event_data():
    """Fetch event data from Eventbrite API."""
    events = []
    for url in EVENTBRITE_URLS:
        response = requests.get(url)
        response.raise_for_status()
        events.extend(response.json().get("events", []))
    return events


def get_category_id(db, event):
    """Fetch or create a category in MongoDB and return its ID."""
    category_name = (event.get("tags", [{}])[1].get("localized", {}).get("display_name", "")
                     if len(event.get("tags", [])) > 1 else "Technology")
    category = db[CATEGORY_COLLECTION].find_one_and_update(
        {"name": category_name},
        {"$setOnInsert": {"createdAt": datetime.now(timezone.utc)}},
        upsert=True,
        return_document=True
    )
    return ObjectId(category["_id"])


def transform_event_data(events, db):
    """Transform raw event data into a MongoDB-ready format."""
    return [
        {
            "_id": ObjectId(),
            "title": event.get("name", "").title(),
            "description": event.get("summary", ""),
            "location": event.get("primary_venue", {}).get("address", {}).get("localized_address_display", ""),
            "imageUrl": event.get("image", {}).get("original", {}).get("url", ""),
            "startDateTime": datetime.now(timezone.utc) + timedelta(days=random.randint(1, 30)),
            "endDateTime": datetime.now(timezone.utc) + timedelta(days=random.randint(6, 35)),
            "price": "",
            "isFree": True,
            "url": format_url(event.get("name", "unknown-event")),
            "category": get_category_id(db, event),
            "organizer": ObjectId(random.choice(USERS)),
            "createdAt": datetime.now(timezone.utc),
            "__v": 0
        }
        for event in events
    ]


def insert_to_mongodb(data):
    """Insert event data into MongoDB."""
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    result = db[EVENT_COLLECTION].insert_many(data)
    print(f"Inserted {len(result.inserted_ids)} documents into MongoDB.")


def main():
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        
        events = fetch_event_data()
        transformed_data = transform_event_data(events, db)
        insert_to_mongodb(transformed_data)
        print("Event data has been inserted into MongoDB.")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()