from bson import ObjectId
from typing import Any, Dict, List, Union

def convert_objectid_to_str(obj: Any) -> Any:
    """Recursively converts ObjectId to str in dictionaries and lists."""
    if isinstance(obj, dict):
        return {k: convert_objectid_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj
