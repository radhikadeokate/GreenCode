
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GreenCode API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg://greencode:change_me@localhost:5432/greencode"
    secret_key: str = "development-only-change-me"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
