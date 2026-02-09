# Progress

Track your progress through the masterclass. Update this file as you complete modules - Claude Code reads this to understand where you are in the project.

## Convention
- `[ ]` = Not started
- `[-]` = In progress
- `[x]` = Completed

## Modules

### Module 1: App Shell + Observability
- [x] Task 1: Project Scaffolding (frontend Vite+React+TS+Tailwind+shadcn, backend FastAPI+Python venv)
- [x] Task 2: Supabase Schema + RLS (threads table with policies, indexes, updated_at trigger)
- [x] Task 3: Authentication (backend Supabase server-side auth, frontend AuthContext + LoginPage + ProtectedRoute)
- [x] Task 4: Thread CRUD API (GET/POST/PATCH/DELETE /api/threads/)
- [x] Task 5: Chat UI (ChatLayout, ThreadSidebar, ChatArea, MessageList, MessageBubble, ChatInput)
- [x] Task 6: OpenAI Responses API (streaming with store=True, previous_response_id threading)
- [x] Task 7: SSE Streaming Frontend (fetch-event-source, useChat hook)
- [x] Task 8: File Upload (vector store per thread, FileUploadButton component)
- [x] Task 9: LangSmith Tracing (wrap_openai auto-tracing)
- [x] Task 10: E2E Validation

**Status:** Code complete. Fully validated end-to-end. Not yet committed to git.

### Post-validation additions
- [x] Messages table (public.messages) — persists user/assistant messages to Supabase, loaded on thread switch
- [x] LangSmith fix — added `load_dotenv()` so env vars are visible to LangSmith SDK; tracing confirmed working
- [x] Port changes — frontend on 5174, backend on 8001 (avoids conflicts with other local projects)
- [x] All libraries upgraded to latest versions (frontend npm + backend pip)
- [x] DB password stored in backend config (`SUPABASE_DB_PASSWORD`) for running migrations via psycopg2

### Validation Results (2026-02-06)
- Health endpoint: OK
- Auth: Unauthenticated returns 401, invalid token returns 401, valid token accepted
- Thread CRUD: Create, List, Get by ID, Update title, Delete — all working (204 on delete)
- Chat SSE: Full streaming works — response_id, text_delta (token-by-token), done events
- Context persistence: Follow-up messages remember prior conversation (previous_response_id threading confirmed)
- Independent threads: Separate threads have isolated conversation context
- File upload: Returns file_id + vector_store_id from OpenAI
- File search (RAG): Model correctly retrieves and answers from uploaded document content
- LangSmith: Traces visible in rag-masterclass project (confirmed via API)
- Frontend: TypeScript clean (zero errors), production build successful

### Module 2: Document Ingestion + RAG
- [ ] Not started

### Module 3+
- [ ] Not started
