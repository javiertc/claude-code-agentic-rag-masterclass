from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import threads, chat, files

app = FastAPI(title="RAG Masterclass API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(threads.router)
app.include_router(chat.router)
app.include_router(files.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
