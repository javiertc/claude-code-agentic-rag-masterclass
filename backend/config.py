from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str = ""
    supabase_db_password: str = ""

    openai_api_key: str
    openai_model: str = "gpt-4.1-mini"

    langsmith_tracing: bool = True
    langsmith_api_key: str = ""
    langsmith_project: str = "rag-masterclass"

    class Config:
        env_file = ".env"


settings = Settings()
