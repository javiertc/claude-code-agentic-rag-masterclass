from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from auth import get_current_user
from database import supabase
from services.openai_service import get_or_create_vector_store, upload_file_to_vector_store

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/upload/{thread_id}")
async def upload_file(
    thread_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    # Verify thread ownership
    result = (
        supabase.table("threads")
        .select("*")
        .eq("id", thread_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Thread not found")

    thread = result.data[0]

    # Get or create vector store for this thread
    vector_store_id = thread.get("vector_store_id")
    if not vector_store_id:
        vector_store_id = get_or_create_vector_store(thread_id)
        supabase.table("threads").update(
            {"vector_store_id": vector_store_id}
        ).eq("id", thread_id).eq("user_id", user_id).execute()

    # Upload file
    content = await file.read()
    file_id = upload_file_to_vector_store(
        vector_store_id, content, file.filename or "upload"
    )

    return {"file_id": file_id, "vector_store_id": vector_store_id}
