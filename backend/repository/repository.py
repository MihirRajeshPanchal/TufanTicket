from pymongo import MongoClient
from bson.objectid import ObjectId
from pydantic import BaseModel
from typing import Optional, Tuple, TypeVar, Any, Dict, List

T = TypeVar("T", bound=BaseModel)


class MongoDBClient:
    def __init__(self, database_url: str, database_name: str):
        self.client = MongoClient(database_url,tls=True,tlsAllowInvalidCertificates=True)
        self.db = self.client[database_name]

    def _get_collection(self, collection_name: str):
        return self.db[collection_name]

    def create(self, collection_name: str, model: T) -> str:
        collection = self._get_collection(collection_name)
        model_dict = model.model_dump(exclude_none=True)
        result = collection.insert_one(model_dict)
        return str(result.inserted_id)

    def read(self, collection_name: str, document_id: str) -> Optional[Dict[str, Any]]:
        collection = self._get_collection(collection_name)
        document = collection.find_one({"_id": ObjectId(document_id)})
        if document:
            document["_id"] = str(document["_id"]) 
        return document

    def read_by_key_value(self, collection_name: str, key: str, value: Any) -> List[Dict[str, Any]]:
        try:
            collection = self._get_collection(collection_name)
            documents = collection.find({key: value})
            result = []
            for doc in documents:
                doc["_id"] = str(doc["_id"])
                result.append(doc)
            return result
        except Exception as e:
            return None
    
    def read_by_id(self, collection_name: str, key: str, value: Any) -> List[Dict[str, Any]]:
        try:
            collection = self._get_collection(collection_name)
            
            if key == "_id" and isinstance(value, str):
                value = ObjectId(value)

            documents = collection.find({key: value})
            result = []
            for doc in documents:
                doc["_id"] = str(doc["_id"])  
                result.append(doc)
            return result
        except Exception as e:
            return None
        
    def read_multiple_by_key_value(self, collection_name: str, key1: str, value1: Any,  key2: str, value2: Any) -> List[Dict[str, Any]]:
        try:
            collection = self._get_collection(collection_name)
            documents = collection.find({key1: value1, key2: value2})
            result = []
            for doc in documents:
                doc["_id"] = str(doc["_id"])
                result.append(doc)
            return result
        except Exception as e:
            return None
        
    def update(self, collection_name: str, document_id: str, update_data: Dict[str, Any]) -> bool:
        collection = self._get_collection(collection_name)
        result = collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    def delete(self, collection_name: str, document_id: str) -> bool:
        collection = self._get_collection(collection_name)
        result = collection.delete_one({"_id": ObjectId(document_id)})
        return result.deleted_count > 0
    
    def read_all(self, collection_name: str) -> List[Dict[str, Any]]:
        """Fetch all documents from the specified collection."""
        collection = self._get_collection(collection_name)
        documents = collection.find()
        result = []
        for doc in documents:
            doc["_id"] = str(doc["_id"])
            result.append(doc)
        return result
    
    def find(self, collection_name: str, query: Dict[str, Any], limit: int = 0) -> List[Dict[str, Any]]:
        try:
            collection = self._get_collection(collection_name)
            documents = collection.find(query).sort('created_at', 1).limit(limit)
            result = []
            for doc in documents:
                doc["_id"] = str(doc["_id"])
                result.append(doc)
            return result
        except Exception as e:
            return []
        
    def find_one(self, collection_name: str, query: Dict[str, Any], sort: List[Tuple[str, int]] = None) -> Optional[Dict[str, Any]]:
        try:
            collection = self._get_collection(collection_name)
            if sort is None:
                sort = [('created_at', -1)]
            
            document = collection.find_one(query, sort=sort)
            
            if document:
                document["_id"] = str(document["_id"])
            
            return document
        except Exception as e:
            print(f"Error in find_one: {e}")
            return None
        
    def find_last_two(self, collection_name: str, query: Dict[str, Any], sort: List[Tuple[str, int]] = None) -> List[Optional[Dict[str, Any]]]:
        try:
            collection = self._get_collection(collection_name)
            if sort is None:
                sort = [('_id', -1)]

            cursor = collection.find(query).sort(sort).limit(2)
            documents = list(cursor)

            if len(documents) == 0:
                return []
            elif len(documents) == 1:
                document = documents[0]
                document["_id"] = str(document["_id"])
                return [document, document]

            for document in documents:
                document["_id"] = str(document["_id"])
            
            return documents
        
        except Exception as e:
            print(f"Error in find_last_two: {e}")
            return []