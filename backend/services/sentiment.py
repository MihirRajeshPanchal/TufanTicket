import torch
import torch.nn.functional as F
from backend.constants.tufan import tokenizer, conviction_model

def get_conviction_score(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    with torch.no_grad():
        outputs = conviction_model(**inputs)
    
    logits = outputs.logits

    probs = F.softmax(logits, dim=-1).squeeze()

    conviction_scores = torch.tensor([-1.0, 0.0, 1.0])

    conviction_score = torch.dot(probs, conviction_scores).item()

    return conviction_score
