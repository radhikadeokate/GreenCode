
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class AnalysisCreate(BaseModel):
    language: str = Field(min_length=1, max_length=30)
    source_code: str = Field(min_length=1, max_length=200_000)


class AnalysisResponse(BaseModel):
    id: int
    project_id: int
    status: Literal["queued", "running", "completed", "failed"]
    language: str
    green_score: int | None
    energy_status: str
    runtime_metrics: dict[str, Any] | None
    results: dict[str, Any] | None
    error_message: str | None
    created_at: datetime
    completed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)

class AnalysisUpdate(BaseModel):
    status: Literal["queued", "running", "completed", "failed"] | None = None
    green_score: int | None = Field(default=None, ge=0, le=100)
    energy_status: Literal[
        "estimated",
        "hardware_measured",
        "validated",
        "unavailable",
    ] | None = None
    runtime_metrics: dict[str, Any] | None = None
    results: dict[str, Any] | None = None
    error_message: str | None = None
