from backend.constants.chatbot import NLP_RESPONSE
from backend.constants.tufan import openai_llm
from langchain.output_parsers import OutputFixingParser
from langchain_core.output_parsers import JsonOutputParser
from backend.models.chatbot import ChatbotResponse

def generate_nlp_response(query, context):
    chain = (
        NLP_RESPONSE
        | openai_llm
        | OutputFixingParser.from_llm(
            parser=JsonOutputParser(pydantic_object=ChatbotResponse), llm=openai_llm
        )
    )

    result = chain.invoke(
        {
            "query": query,
            "context": context,
        }
    )
    print(result)
    return result
