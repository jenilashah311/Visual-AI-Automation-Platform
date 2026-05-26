from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.config import settings
from app.core.orchestrator import WorkflowOrchestrator
from app.core.state_store import StateStore
from app.database import async_session
from app.models.workflow import Execution, ExecutionStatus, Workflow
from app.nodes.base import NodeResult
from app.schemas.workflow import GraphJSON

router = APIRouter(tags=["websocket"])

state_store = StateStore(settings.redis_url)
orchestrator = WorkflowOrchestrator(state_store)


@router.websocket("/ws/executions/{execution_id}")
async def execution_websocket(websocket: WebSocket, execution_id: UUID):
    await websocket.accept()

    try:
        async with async_session() as db:
            execution = await db.get(Execution, execution_id)
            if not execution:
                await websocket.send_json(
                    {"type": "execution_failed", "error": "Execution not found"}
                )
                await websocket.close()
                return

            workflow = await db.get(Workflow, execution.workflow_id)
            if not workflow:
                await websocket.send_json(
                    {"type": "execution_failed", "error": "Workflow not found"}
                )
                await websocket.close()
                return

            execution.status = ExecutionStatus.running
            execution.started_at = datetime.now(timezone.utc)
            await db.commit()

            graph = GraphJSON(**workflow.graph_json)

            await websocket.send_json(
                {
                    "type": "execution_started",
                    "execution_id": str(execution_id),
                }
            )

            async def on_node_update(node_id: str, result: NodeResult):
                await websocket.send_json(
                    {
                        "type": "node_update",
                        "node_id": node_id,
                        "status": result.status,
                        "output": str(result.output)[:2000],
                        "error": result.error,
                        "duration_ms": result.duration_ms,
                    }
                )

            try:
                exec_result = await orchestrator.execute(
                    str(execution_id),
                    graph,
                    execution.input_data,
                    on_node_update,
                )

                async with async_session() as update_db:
                    exec_record = await update_db.get(Execution, execution_id)
                    if exec_record:
                        exec_record.node_logs = exec_result.get("node_logs", {})
                        exec_record.finished_at = datetime.now(timezone.utc)

                        if exec_result["status"] == "completed":
                            exec_record.status = ExecutionStatus.completed
                            exec_record.output_data = {"output": exec_result.get("output")}
                            await websocket.send_json(
                                {
                                    "type": "execution_completed",
                                    "output": str(exec_result.get("output", "")),
                                }
                            )
                        else:
                            exec_record.status = ExecutionStatus.failed
                            exec_record.output_data = {"error": exec_result.get("error")}
                            await websocket.send_json(
                                {
                                    "type": "execution_failed",
                                    "error": exec_result.get("error", "Unknown error"),
                                }
                            )
                        await update_db.commit()

            except Exception as e:
                async with async_session() as update_db:
                    exec_record = await update_db.get(Execution, execution_id)
                    if exec_record:
                        exec_record.status = ExecutionStatus.failed
                        exec_record.finished_at = datetime.now(timezone.utc)
                        exec_record.output_data = {"error": str(e)}
                        await update_db.commit()

                await websocket.send_json(
                    {"type": "execution_failed", "error": str(e)}
                )

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json(
                {"type": "execution_failed", "error": str(e)}
            )
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
