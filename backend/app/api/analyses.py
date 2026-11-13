
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api.dependencies import get_current_user, get_db
from backend.app.models.analysis import Analysis
from backend.app.models.project import Project
from backend.app.models.user import User
from backend.app.schemas.analysis import (
    AnalysisCreate,
    AnalysisResponse,
    AnalysisUpdate,
)

router = APIRouter(
    prefix="/projects/{project_id}/analyses",
    tags=["Analyses"],
)


def get_owned_project(
    project_id: int,
    current_user: User,
    db: Session,
) -> Project:
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found.",
        )

    return project


@router.post(
    "",
    response_model=AnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_analysis(
    project_id: int,
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_project(project_id, current_user, db)

    analysis = Analysis(
        project_id=project_id,
        language=payload.language,
        source_code=payload.source_code,
        status="queued",
        energy_status="unavailable",
    )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis


@router.get("", response_model=list[AnalysisResponse])
def list_analyses(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_project(project_id, current_user, db)

    return (
        db.query(Analysis)
        .filter(Analysis.project_id == project_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    project_id: int,
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_project(project_id, current_user, db)

    analysis = (
        db.query(Analysis)
        .filter(
            Analysis.id == analysis_id,
            Analysis.project_id == project_id,
        )
        .first()
    )

    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )

    return analysis


@router.patch("/{analysis_id}", response_model=AnalysisResponse)
def update_analysis(
    project_id: int,
    analysis_id: int,
    payload: AnalysisUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_project(project_id, current_user, db)

    analysis = (
        db.query(Analysis)
        .filter(
            Analysis.id == analysis_id,
            Analysis.project_id == project_id,
        )
        .first()
    )

    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )

    changes = payload.model_dump(exclude_unset=True)

    if changes.get("status") == "completed":
        changes["completed_at"] = datetime.now(timezone.utc)
        changes["error_message"] = None

    elif changes.get("status") == "failed":
        changes["completed_at"] = datetime.now(timezone.utc)

    for field, value in changes.items():
        setattr(analysis, field, value)

    db.commit()
    db.refresh(analysis)

    return analysis


@router.get("/compare/{first_analysis_id}/{second_analysis_id}")
def compare_analyses(
    project_id: int,
    first_analysis_id: int,
    second_analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_project(project_id, current_user, db)

    analyses = (
        db.query(Analysis)
        .filter(
            Analysis.project_id == project_id,
            Analysis.id.in_(
                [first_analysis_id, second_analysis_id]
            ),
        )
        .all()
    )

    by_id = {analysis.id: analysis for analysis in analyses}

    first = by_id.get(first_analysis_id)
    second = by_id.get(second_analysis_id)

    if first is None or second is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both analyses were not found for this project.",
        )

    return {
        "first_analysis": {
            "id": first.id,
            "status": first.status,
            "green_score": first.green_score,
            "energy_status": first.energy_status,
            "runtime_metrics": first.runtime_metrics,
            "results": first.results,
        },
        "second_analysis": {
            "id": second.id,
            "status": second.status,
            "green_score": second.green_score,
            "energy_status": second.energy_status,
            "runtime_metrics": second.runtime_metrics,
            "results": second.results,
        },
    }
