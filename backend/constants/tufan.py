from backend.repository.repository import MongoDBClient
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from neo4j import GraphDatabase
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from langchain_community.vectorstores import Neo4jVector
from langchain_openai import OpenAIEmbeddings

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

tokenizer = AutoTokenizer.from_pretrained("finiteautomata/bertweet-base-sentiment-analysis")
conviction_model = AutoModelForSequenceClassification.from_pretrained("finiteautomata/bertweet-base-sentiment-analysis")

vector_index = Neo4jVector.from_existing_graph(
    OpenAIEmbeddings(),
    url=NEO4J_URI,
    username=NEO4J_USERNAME,
    password=NEO4J_PASSWORD,
    index_name='event_index',
    node_label="Event",
    text_node_properties=['description', 'createdAt', 'startDateTime', 'endDateTime','title','id','url'],
    embedding_node_property='embedding',
)