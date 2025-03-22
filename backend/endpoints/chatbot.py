from fastapi import APIRouter
from backend.models.chatbot import ChatbotRequest
from backend.constants.tufan import vector_index

router = APIRouter()

@router.post("/chatbot")
async def organizers_endpoint(request: ChatbotRequest):
    response = vector_index.similarity_search(request.query, top_k=5)
    
    return response