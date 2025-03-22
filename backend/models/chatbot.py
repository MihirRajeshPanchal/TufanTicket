from pydantic import BaseModel

class ChatbotRequest(BaseModel):
    query: str