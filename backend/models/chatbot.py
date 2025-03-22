from pydantic import BaseModel

class ChatbotRequest(BaseModel):
    query: str
    
class ChatbotResponse(BaseModel):
    nlp_response: str