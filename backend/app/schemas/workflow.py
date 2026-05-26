from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NodeDefinition(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: dict[str, Any] = Field(default_factory=dict)


class EdgeDefinition(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str | None = None
    targetHandle: str | None = None


class GraphJSON(BaseModel):
    nodes: list[NodeDefinition]
    edges: list[EdgeDefinition]


class WorkflowCreate(BaseModel):
    name: str
    description: str | None = None
    graph_json: GraphJSON | dict


class WorkflowUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    graph_json: GraphJSON | dict | None = None


class WorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    graph_json: dict
    created_at: datetime
    updated_at: datetime


class WorkflowListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    created_at: datetime


class ExecutionCreate(BaseModel):
    workflow_id: UUID
    input_data: dict[str, Any] = Field(default_factory=dict)


class ExecutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workflow_id: UUID
    status: str
    input_data: dict
    output_data: dict | None
    node_logs: dict
    started_at: datetime | None
    finished_at: datetime | None
    created_at: datetime
