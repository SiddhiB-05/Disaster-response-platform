from fastapi import WebSocket
from typing import List, Dict, Any
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_event(self, event_name: str, payload: Dict[str, Any]):
        """
        Broadcast JSON WebSocket event to all connected clients.
        Payload structure:
        {
            "event": "incident_updated",
            "timestamp": "2026-08-25T15:45:00Z",
            "data": {...}
        }
        """
        message = {
            "event": event_name,
            "timestamp": datetime.utcnow().isoformat(),
            "data": payload
        }
        
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

ws_manager = ConnectionManager()
