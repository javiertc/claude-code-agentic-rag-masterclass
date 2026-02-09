from fastapi import APIRouter, Depends, HTTPException, status

from auth import get_current_user
from database import supabase
from models.threads import ThreadCreate, ThreadUpdate

router = APIRouter(prefix="/api/threads", tags=["threads"])


@router.get("/")
async def list_threads(user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("threads")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_thread(
    body: ThreadCreate, user_id: str = Depends(get_current_user)
):
    result = (
        supabase.table("threads")
        .insert({"user_id": user_id, "title": body.title})
        .execute()
    )
    return result.data[0]


@router.get("/{thread_id}")
async def get_thread(thread_id: str, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("threads")
        .select("*")
        .eq("id", thread_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Thread not found")
    return result.data[0]


@router.patch("/{thread_id}")
async def update_thread(
    thread_id: str,
    body: ThreadUpdate,
    user_id: str = Depends(get_current_user),
):
    result = (
        supabase.table("threads")
        .update({"title": body.title})
        .eq("id", thread_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Thread not found")
    return result.data[0]


@router.get("/{thread_id}/messages")
async def list_messages(thread_id: str, user_id: str = Depends(get_current_user)):
    # Verify thread belongs to user
    thread = (
        supabase.table("threads")
        .select("id")
        .eq("id", thread_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not thread.data:
        raise HTTPException(status_code=404, detail="Thread not found")

    result = (
        supabase.table("messages")
        .select("*")
        .eq("thread_id", thread_id)
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )
    return result.data


@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thread(
    thread_id: str, user_id: str = Depends(get_current_user)
):
    result = (
        supabase.table("threads")
        .delete()
        .eq("id", thread_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Thread not found")
