from typing import Dict, List, Optional
from datetime import datetime
import json
from pathlib import Path

from .state import Message, ModuleType, MessageType, SystemState
from .config import get_config

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for handling Message objects and other custom types."""
    def default(self, obj):
        if isinstance(obj, Message):
            return {
                "__type__": "Message",
                "type": str(obj.type.value),
                "content": obj.content,
                "from_module": str(obj.from_module.value),
                "to_module": str(obj.to_module.value),
                "timestamp": obj.timestamp.isoformat(),
                "metadata": obj.metadata
            }
        if isinstance(obj, datetime):
            return {"__type__": "datetime", "value": obj.isoformat()}
        if isinstance(obj, (ModuleType, MessageType)):
            return str(obj.value)
        return super().default(obj)

class SafetyChecker:
    """Utility class for performing safety checks on operations."""
    
    def __init__(self, config: Dict = None):
        self.config = config or get_config()["system"]["safety_checks"]
    
    def check_operation(self, operation: str, context: Dict) -> Dict:
        """Check if an operation is safe to execute."""
        if not self.config["high_risk_operations"]:
            return {"passed": True, "reason": "Safety checks disabled"}
            
        checks = {
            "user_approval": self._check_user_approval(operation, context),
            "risk_level": self._assess_risk_level(operation, context),
            "resource_limits": self._check_resource_limits(context)
        }
        
        passed = all(check["passed"] for check in checks.values())
        return {
            "passed": passed,
            "checks": checks,
            "timestamp": datetime.now().isoformat()
        }
    
    def _check_user_approval(self, operation: str, context: Dict) -> Dict:
        """Check if operation requires user approval."""
        requires_approval = self.config["user_approval_required"]
        return {
            "passed": not requires_approval,
            "reason": "User approval required" if requires_approval else "No approval needed"
        }
    
    def _assess_risk_level(self, operation: str, context: Dict) -> Dict:
        """Assess the risk level of an operation."""
        # Implement risk assessment logic here
        return {"passed": True, "reason": "Risk level acceptable"}
    
    def _check_resource_limits(self, context: Dict) -> Dict:
        """Check if operation would exceed resource limits."""
        current_tasks = context.get("active_tasks", 0)
        max_tasks = self.config["max_concurrent_tasks"]
        return {
            "passed": current_tasks < max_tasks,
            "reason": f"Tasks: {current_tasks}/{max_tasks}"
        }

class StateManager:
    """Utility class for managing system state."""
    
    def __init__(self, config: Dict = None):
        self.config = config or get_config()
        self.state_dir = Path(self.config["persistence"]["storage_path"])
        if self.config["persistence"]["enabled"]:
            self.state_dir.mkdir(parents=True, exist_ok=True)
    
    def save_state(self, state: SystemState, state_id: str):
        """Save system state to persistent storage."""
        if not self.config["persistence"]["enabled"]:
            return
            
        state_file = self.state_dir / f"{state_id}.json"
        with state_file.open("w") as f:
            json.dump(state, f, cls=CustomJSONEncoder)
    
    def load_state(self, state_id: str) -> Optional[SystemState]:
        """Load system state from persistent storage."""
        if not self.config["persistence"]["enabled"]:
            return None
            
        state_file = self.state_dir / f"{state_id}.json"
        if not state_file.exists():
            return None
            
        with state_file.open("r") as f:
            return json.load(f, object_hook=self._deserialize_state)
    
    def _deserialize_state(self, obj):
        """Custom deserializer for state objects."""
        if "__type__" not in obj:
            return obj
            
        if obj["__type__"] == "Message":
            return Message(
                type=MessageType(obj["type"]),
                content=obj["content"],
                from_module=ModuleType(obj["from_module"]),
                to_module=ModuleType(obj["to_module"]),
                timestamp=datetime.fromisoformat(obj["timestamp"]),
                metadata=obj["metadata"]
            )
        if obj["__type__"] == "datetime":
            return datetime.fromisoformat(obj["value"])
        return obj

class MetricsCollector:
    """Utility class for collecting and managing system metrics."""
    
    def __init__(self):
        self.reset_metrics()
    
    def reset_metrics(self):
        """Reset all metrics to initial values."""
        self.metrics = {
            "requests_processed": 0,
            "errors": 0,
            "average_processing_time": 0.0,
            "successful_responses": 0,
            "module_metrics": {
                str(ModuleType.META_ORCHESTRATOR.value): {"calls": 0, "errors": 0},
                str(ModuleType.TOOL_BUILDER.value): {"calls": 0, "errors": 0},
                str(ModuleType.CO_SCIENTIST.value): {"calls": 0, "errors": 0}
            }
        }
    
    def update_metrics(self, metric_type: str, value: float = 1.0, module: ModuleType = None):
        """Update system metrics."""
        if metric_type == "request_processed":
            self.metrics["requests_processed"] += value
            # Also increment successful responses for chat responses
            self.metrics["successful_responses"] += value
            if module:
                module_key = str(module.value)
                if module_key in self.metrics["module_metrics"]:
                    self.metrics["module_metrics"][module_key]["calls"] += value
        elif metric_type == "error":
            self.metrics["errors"] += value
            if module:
                module_key = str(module.value)
                if module_key in self.metrics["module_metrics"]:
                    self.metrics["module_metrics"][module_key]["errors"] += value
        elif metric_type == "module_call" and module:
            module_key = str(module.value)
            if module_key in self.metrics["module_metrics"]:
                self.metrics["module_metrics"][module_key]["calls"] += value
        elif metric_type == "average_processing_time":
            current_avg = self.metrics["average_processing_time"]
            total_requests = self.metrics["requests_processed"]
            if total_requests > 0:
                self.metrics["average_processing_time"] = (
                    (current_avg * (total_requests - 1) + value) / total_requests
                )
    
    def get_metrics(self) -> Dict:
        """Get current system metrics."""
        return self.metrics.copy() 