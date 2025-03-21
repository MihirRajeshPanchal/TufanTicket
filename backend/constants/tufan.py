from backend.repository.repository import MongoDBClient
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_neo4j import Neo4jGraph
from neo4j import GraphDatabase

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

openai_llm = ChatOpenAI(temperature=0, model_name="gpt-4o")

DATABASE_NAME = "evently"
mongo_client = MongoDBClient(DATABASE_URL , DATABASE_NAME)

NEO4J_URI = os.getenv('NEO4J_URI')
NEO4J_USERNAME = os.getenv('NEO4J_USERNAME')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD')

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))