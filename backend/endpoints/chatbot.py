from fastapi import APIRouter
from backend.models.chatbot import ChatbotRequest
from backend.constants.tufan import vector_index
from backend.services.chatbot import generate_nlp_response
from backend.constants.tufan import mongo_client

router = APIRouter()


@router.post("/chatbot")
async def organizers_endpoint(request: ChatbotRequest):
    response = vector_index.similarity_search(request.query, top_k=5)

    image_urls = [doc.metadata["imageUrl"] for doc in response if "imageUrl" in doc.metadata]

    if not image_urls:
        return {"events": [], "nlp": "No matching events found."}

    mongo_query = {"imageUrl": {"$in": image_urls}}
    events = mongo_client.find("events", mongo_query, limit=0)

    events_sorted = sorted(events, key=lambda x: x["startDateTime"])
    
    nlp = generate_nlp_response(request.query, events_sorted)

    return {"events": events_sorted, "nlp": nlp["nlp_response"]}
