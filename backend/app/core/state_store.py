import json

import redis.asyncio as redis


class StateStore:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url, decode_responses=True)

    def _key(self, execution_id: str, node_id: str) -> str:
        return f"execution:{execution_id}:node:{node_id}"

    async def set_node_state(
        self, execution_id: str, node_id: str, state: dict
    ) -> None:
        key = self._key(execution_id, node_id)
        await self.redis.set(key, json.dumps(state), ex=3600)

    async def get_node_state(
        self, execution_id: str, node_id: str
    ) -> dict | None:
        key = self._key(execution_id, node_id)
        data = await self.redis.get(key)
        if data is None:
            return None
        return json.loads(data)

    async def get_all_node_states(self, execution_id: str) -> dict[str, dict]:
        pattern = f"execution:{execution_id}:node:*"
        result: dict[str, dict] = {}
        async for key in self.redis.scan_iter(match=pattern):
            node_id = key.split(":node:")[-1]
            data = await self.redis.get(key)
            if data:
                result[node_id] = json.loads(data)
        return result

    async def clear_execution(self, execution_id: str) -> None:
        pattern = f"execution:{execution_id}:*"
        async for key in self.redis.scan_iter(match=pattern):
            await self.redis.delete(key)
