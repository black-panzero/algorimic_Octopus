from typing import Dict, List, Literal, TypedDict, Optional
from dataclasses import dataclass
from enum import Enum
from datetime import datetime

class ModuleType(Enum):
    TOOL_BUILDER = "tool_builder"
    CO_SCIENTIST = "co_scientist"
    META_ORCHESTRATOR = "meta_orchestrator"

class MessageType(Enum):
    TASK = "task"
    RESPONSE = "response"
    ERROR = "error"
    STATUS = "status"

@dataclass
class Message:
    type: MessageType
    content: str
    from_module: ModuleType
    to_module: ModuleType
    timestamp: datetime = datetime.now()
    metadata: Optional[Dict] = None

class SystemState(TypedDict):
    messages: List[Message]
    research_goals: List[str]
    active_modules: List[ModuleType]
    system_logs: List[Dict]
    configurations: Dict
    metrics: Dict

class MetaOrchestratorState(TypedDict):
    system_state: SystemState
    current_task: Optional[str]
    pending_requests: List[Dict]
    safety_flags: Dict[str, bool]
    next_action: Literal["process_request", "coordinate_modules", "handle_error", "idle", "__end__"] 