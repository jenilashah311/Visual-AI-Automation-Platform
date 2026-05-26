#!/usr/bin/env bash
# Create sample workflows via the API. Requires backend on http://localhost:8000

set -e
API="${API_URL:-http://localhost:8000}"

echo "==> Health check"
curl -sf "$API/health" | jq .

echo ""
echo "==> Creating sample workflow: Document Q&A"
WORKFLOW=$(curl -sf -X POST "$API/api/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample — Document Q&A",
    "description": "Demo project: answer questions from pasted text",
    "graph_json": {
      "nodes": [
        {
          "id": "n1",
          "type": "inputNode",
          "position": {"x": 250, "y": 50},
          "data": {"label": "Paste document + question", "nodeType": "inputNode"}
        },
        {
          "id": "n2",
          "type": "llmNode",
          "position": {"x": 250, "y": 180},
          "data": {
            "label": "Q&A Agent",
            "nodeType": "llmNode",
            "system_prompt": "You are a helpful assistant that answers questions based on provided documents.",
            "prompt": "{{input}}",
            "model": "llama-3.3-70b-versatile",
            "max_tokens": 1000
          }
        },
        {
          "id": "n3",
          "type": "outputNode",
          "position": {"x": 250, "y": 310},
          "data": {"label": "Answer", "nodeType": "outputNode"}
        }
      ],
      "edges": [
        {"id": "e1", "source": "n1", "target": "n2"},
        {"id": "e2", "source": "n2", "target": "n3"}
      ]
    }
  }')
echo "$WORKFLOW" | jq .
WORKFLOW_ID=$(echo "$WORKFLOW" | jq -r .id)

echo ""
echo "==> Creating sample workflow: Research summarizer"
curl -sf -X POST "$API/api/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample — Research summarizer",
    "description": "Demo project: web search then LLM summary",
    "graph_json": {
      "nodes": [
        {"id": "n1", "type": "inputNode", "position": {"x": 250, "y": 50}, "data": {"label": "Your question", "nodeType": "inputNode"}},
        {"id": "n2", "type": "webSearchNode", "position": {"x": 250, "y": 180}, "data": {"label": "Web Search", "nodeType": "webSearchNode", "query_template": "{{input}}"}},
        {"id": "n3", "type": "llmNode", "position": {"x": 250, "y": 310}, "data": {"label": "Summarizer", "nodeType": "llmNode", "prompt": "Based on these search results:\n{{input}}\n\nProvide a clear, concise answer.", "model": "llama-3.3-70b-versatile"}},
        {"id": "n4", "type": "outputNode", "position": {"x": 250, "y": 440}, "data": {"label": "Result", "nodeType": "outputNode"}}
      ],
      "edges": [
        {"id": "e1", "source": "n1", "target": "n2"},
        {"id": "e2", "source": "n2", "target": "n3"},
        {"id": "e3", "source": "n3", "target": "n4"}
      ]
    }
  }' | jq '{id, name}'

echo ""
echo "==> All workflows"
curl -sf "$API/api/workflows" | jq .

echo ""
echo "==> Creating a pending execution for Document Q&A (run via UI WebSocket or wscat)"
EXEC=$(curl -sf -X POST "$API/api/executions" \
  -H "Content-Type: application/json" \
  -d "{
    \"workflow_id\": \"$WORKFLOW_ID\",
    \"input_data\": {\"text\": \"Document: The Eiffel Tower is in Paris. Question: What city is the Eiffel Tower in?\"}
  }")
echo "$EXEC" | jq .
EXEC_ID=$(echo "$EXEC" | jq -r .id)

echo ""
echo "=============================================="
echo "Sample project created!"
echo "  Workflow ID:  $WORKFLOW_ID"
echo "  Execution ID: $EXEC_ID (status: pending — connect WebSocket to run)"
echo ""
echo "Open UI:  http://localhost:5173"
echo "API docs: http://localhost:8000/docs"
echo ""
echo "To run execution via WebSocket (needs websocat or similar):"
echo "  websocat ws://localhost:8000/ws/executions/$EXEC_ID"
echo "=============================================="
