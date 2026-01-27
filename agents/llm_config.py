import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

_llm_instance = None


def get_shared_llm() -> ChatOpenAI:
    global _llm_instance
    
    if _llm_instance is None:
        api_key = os.getenv('CEREBRAS_API_KEY')
        if not api_key:
            raise ValueError("CEREBRAS_API_KEY not set in environment")
        
        _llm_instance = ChatOpenAI(
            api_key=api_key,
            base_url="https://api.cerebras.ai/v1",
            model=os.getenv('CEREBRAS_MODEL', 'llama-3.3-70b'),
            temperature=float(os.getenv('LLM_TEMPERATURE', '0.7')),
            timeout=120,
            max_retries=2
        )
    
    return _llm_instance
