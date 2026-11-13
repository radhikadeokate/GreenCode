
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    language: str = Field(min_length=1, max_length=30)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = None
    language: str | None = Field(default=None, min_length=1, max_length=30)


class ProjectResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str | None
    language: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
