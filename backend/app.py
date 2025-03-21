from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.endpoints import graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(graph.router)

@app.get("/")
def root():
    return {"message": "Welcome to TufanTicket API!"}