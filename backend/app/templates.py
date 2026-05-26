TEMPLATES = [
    {
        "id": "research-summarizer",
        "name": "Research summarizer",
        "description": "Search the web and summarize results with an LLM",
        "graph_json": {
            "nodes": [
                {
                    "id": "n1",
                    "type": "inputNode",
                    "position": {"x": 250, "y": 50},
                    "data": {
                        "label": "Your question",
                        "nodeType": "inputNode",
                    },
                },
                {
                    "id": "n2",
                    "type": "webSearchNode",
                    "position": {"x": 250, "y": 180},
                    "data": {
                        "label": "Web Search",
                        "nodeType": "webSearchNode",
                        "query_template": "{{input}}",
                    },
                },
                {
                    "id": "n3",
                    "type": "llmNode",
                    "position": {"x": 250, "y": 310},
                    "data": {
                        "label": "Summarizer",
                        "nodeType": "llmNode",
                        "prompt": "Based on these search results:\n{{input}}\n\nProvide a clear, concise answer.",
                        "model": "llama-3.3-70b-versatile",
                    },
                },
                {
                    "id": "n4",
                    "type": "outputNode",
                    "position": {"x": 250, "y": 440},
                    "data": {
                        "label": "Result",
                        "nodeType": "outputNode",
                    },
                },
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3"},
                {"id": "e3", "source": "n3", "target": "n4"},
            ],
        },
    },
    {
        "id": "document-qa",
        "name": "Document Q&A",
        "description": "Answer questions about a pasted document",
        "graph_json": {
            "nodes": [
                {
                    "id": "n1",
                    "type": "inputNode",
                    "position": {"x": 250, "y": 50},
                    "data": {
                        "label": "Paste document + question",
                        "nodeType": "inputNode",
                    },
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
                    },
                },
                {
                    "id": "n3",
                    "type": "outputNode",
                    "position": {"x": 250, "y": 310},
                    "data": {
                        "label": "Answer",
                        "nodeType": "outputNode",
                    },
                },
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3"},
            ],
        },
    },
    {
        "id": "length-router",
        "name": "Length-based router",
        "description": "Route short vs long text to different LLM prompts",
        "graph_json": {
            "nodes": [
                {
                    "id": "n1",
                    "type": "inputNode",
                    "position": {"x": 300, "y": 50},
                    "data": {
                        "label": "Input text",
                        "nodeType": "inputNode",
                    },
                },
                {
                    "id": "n2",
                    "type": "conditionNode",
                    "position": {"x": 300, "y": 180},
                    "data": {
                        "label": "Is it long?",
                        "nodeType": "conditionNode",
                        "condition": "len(input) > 200",
                        "true_label": "true",
                        "false_label": "false",
                    },
                },
                {
                    "id": "n3",
                    "type": "llmNode",
                    "position": {"x": 100, "y": 350},
                    "data": {
                        "label": "Summarizer",
                        "nodeType": "llmNode",
                        "prompt": "Summarize this in 2 sentences: {{input}}",
                        "model": "llama-3.3-70b-versatile",
                    },
                },
                {
                    "id": "n4",
                    "type": "llmNode",
                    "position": {"x": 500, "y": 350},
                    "data": {
                        "label": "Expander",
                        "nodeType": "llmNode",
                        "prompt": "Expand this into a detailed explanation: {{input}}",
                        "model": "llama-3.3-70b-versatile",
                    },
                },
                {
                    "id": "n5",
                    "type": "outputNode",
                    "position": {"x": 300, "y": 500},
                    "data": {
                        "label": "Result",
                        "nodeType": "outputNode",
                    },
                },
            ],
            "edges": [
                {"id": "e1", "source": "n1", "target": "n2"},
                {"id": "e2", "source": "n2", "target": "n3", "sourceHandle": "true"},
                {"id": "e3", "source": "n2", "target": "n4", "sourceHandle": "false"},
                {"id": "e4", "source": "n3", "target": "n5"},
                {"id": "e5", "source": "n4", "target": "n5"},
            ],
        },
    },
]
