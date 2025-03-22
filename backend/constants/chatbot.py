from langchain_core.prompts import ChatPromptTemplate

NLP_RESPONSE = ChatPromptTemplate.from_template("""
Analyze the prompt query {query} using this structure:
{{
    "nlp_response": "NLP suggestion Response",
}}

Context: 
{context}

User Query:
{query}

Guidelines: 
- The response should be a JSON object with a key "nlp_response" and a string value.
- The response should be a suggestion for the user query.
- The response should be a natural language response.
- The response should be relevant to the user query.
- The response should be helpful to the user query.
- The response should be concise and clear.
"""
)

