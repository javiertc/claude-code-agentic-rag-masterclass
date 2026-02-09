import json

from fastapi import APIRouter, Depends, HTTPException
from sse_starlette.sse import EventSourceResponse

from auth import get_current_user
from database import supabase
from models.chat import ChatRequest
from services.openai_service import initiate_chat

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/")
async def chat(body: ChatRequest, user_id: str = Depends(get_current_user)):
    # Fetch thread to get previous_response_id and vector_store_id
    result = (
        supabase.table("threads")
        .select("*")
        .eq("id", body.thread_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Thread not found")

    thread = result.data[0]

    # Persist user message
    supabase.table("messages").insert({
        "thread_id": body.thread_id,
        "user_id": user_id,
        "role": "user",
        "content": body.message,
    }).execute()

    async def event_generator():
        assistant_content = ""
        try:
            stream = initiate_chat(
                message=body.message,
                previous_response_id=thread.get("last_response_id"),
                vector_store_id=thread.get("vector_store_id"),
            )

            for event in stream:
                if event.type == "response.created":
                    yield {
                        "event": "response_id",
                        "data": json.dumps({"response_id": event.response.id}),
                    }
                elif event.type == "response.output_text.delta":
                    assistant_content += event.delta
                    yield {
                        "event": "text_delta",
                        "data": json.dumps({"delta": event.delta}),
                    }
                elif event.type == "response.completed":
                    # Update thread with the new response_id
                    supabase.table("threads").update(
                        {"last_response_id": event.response.id}
                    ).eq("id", body.thread_id).eq("user_id", user_id).execute()

                    # Persist assistant message
                    supabase.table("messages").insert({
                        "thread_id": body.thread_id,
                        "user_id": user_id,
                        "role": "assistant",
                        "content": assistant_content,
                    }).execute()

                    yield {
                        "event": "done",
                        "data": json.dumps({"response_id": event.response.id}),
                    }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)}),
            }

    return EventSourceResponse(event_generator())
