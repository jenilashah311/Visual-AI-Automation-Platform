from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql+asyncpg://admin:password@localhost:5432/workflow_db"
    redis_url: str = "redis://localhost:6379"
    groq_api_key: str = ""
    groq_base_url: str = "https://api.groq.com/openai/v1"
    tavily_api_key: str = ""
    e2b_api_key: str = ""
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
