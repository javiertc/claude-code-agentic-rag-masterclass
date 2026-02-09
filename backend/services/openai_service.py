from io import BytesIO
from typing import Optional

from openai import OpenAI
from langsmith.wrappers import wrap_openai

from config import settings

client = wrap_openai(OpenAI(api_key=settings.openai_api_key))


def initiate_chat(
    message: str,
    previous_response_id: Optional[str] = None,
    vector_store_id: Optional[str] = None,
):
    """Stream a response from the OpenAI Responses API."""
    tools = []
    if vector_store_id:
        tools.append(
            {
                "type": "file_search",
                "vector_store_ids": [vector_store_id],
            }
        )

    return client.responses.create(
        model=settings.openai_model,
        input=message,
        previous_response_id=previous_response_id,
        tools=tools if tools else None,
        stream=True,
        store=True,
    )


def get_or_create_vector_store(thread_id: str) -> str:
    """Get or create a vector store for a thread."""
    vector_store = client.vector_stores.create(name=f"thread-{thread_id}")
    return vector_store.id


def upload_file_to_vector_store(
    vector_store_id: str, file_content: bytes, filename: str
) -> str:
    """Upload a file to a vector store and return the file ID."""
    file_obj = client.files.create(
        file=(filename, BytesIO(file_content)),
        purpose="assistants",
    )
    client.vector_stores.files.create(
        vector_store_id=vector_store_id,
        file_id=file_obj.id,
    )
    return file_obj.id
