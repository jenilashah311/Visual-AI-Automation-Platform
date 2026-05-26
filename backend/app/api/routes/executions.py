from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.workflow import Execution, ExecutionStatus, Workflow
from app.schemas.workflow import ExecutionCreate, ExecutionResponse

router = APIRouter(prefix="/api/executions", tags=["executions"])


@router.post("", response_model=ExecutionResponse, status_code=201)
async def create_execution(
    data: ExecutionCreate, db: AsyncSession = Depends(get_db)
):
    workflow = await db.get(Workflow, data.workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    execution = Execution(
        workflow_id=data.workflow_id,
        status=ExecutionStatus.pending,
        input_data=data.input_data,
        node_logs={},
    )
    db.add(execution)
    await db.flush()
    await db.refresh(execution)
    return execution


@router.get("", response_model=list[ExecutionResponse])
async def list_executions(
    workflow_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Execution)
        .where(Execution.workflow_id == workflow_id)
        .order_by(Execution.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{execution_id}", response_model=ExecutionResponse)
async def get_execution(execution_id: UUID, db: AsyncSession = Depends(get_db)):
    execution = await db.get(Execution, execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution
