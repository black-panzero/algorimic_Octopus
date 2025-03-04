import logging
from datetime import datetime
from typing import Dict, Any
import json
from pathlib import Path
from .utils import CustomJSONEncoder

class MetaOrchestratorLogger:
    def __init__(self, log_level: str = "INFO", log_file: str = "meta_orchestrator.log"):
        self.logger = logging.getLogger("meta_orchestrator")
        self.logger.setLevel(getattr(logging, log_level))
        
        # Create logs directory if it doesn't exist
        log_dir = Path("./logs")
        log_dir.mkdir(exist_ok=True)
        
        # File handler
        file_handler = logging.FileHandler(log_dir / log_file)
        file_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        )
        self.logger.addHandler(file_handler)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        )
        self.logger.addHandler(console_handler)

    def _format_log(self, message: str, metadata: Dict[str, Any] = None) -> str:
        """Format log message with metadata."""
        try:
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "message": message,
                **(metadata or {})
            }
            return json.dumps(log_entry, cls=CustomJSONEncoder)
        except Exception as e:
            # Fallback to basic logging if serialization fails
            basic_log = {
                "timestamp": datetime.now().isoformat(),
                "message": str(message),
                "error": f"Serialization failed: {str(e)}"
            }
            return json.dumps(basic_log)

    def log_state_change(self, old_state: Dict, new_state: Dict, action: str):
        """Log state changes."""
        try:
            # Only log essential state information
            essential_state = {
                "action": action,
                "changes": {
                    "messages_count": len(new_state.get("system_state", {}).get("messages", [])),
                    "active_modules": new_state.get("system_state", {}).get("active_modules", []),
                    "next_action": new_state.get("next_action")
                }
            }
            self.logger.info(self._format_log("State change", essential_state))
        except Exception as e:
            self.logger.error(self._format_log(f"Failed to log state change: {str(e)}"))

    def log_message(self, message: Dict):
        """Log inter-module messages."""
        self.logger.info(
            self._format_log(
                "Inter-module message",
                {"message": message}
            )
        )

    def log_error(self, error: Exception, context: Dict = None):
        """Log errors with context."""
        self.logger.error(
            self._format_log(
                str(error),
                {
                    "error_type": type(error).__name__,
                    "context": context
                }
            )
        )

    def log_safety_check(self, operation: str, passed: bool, details: Dict = None):
        """Log safety check results."""
        level = logging.INFO if passed else logging.WARNING
        self.logger.log(
            level,
            self._format_log(
                f"Safety check for operation '{operation}': {'PASSED' if passed else 'FAILED'}",
                {
                    "operation": operation,
                    "passed": passed,
                    "details": details
                }
            )
        )

    def log_metrics(self, metrics: Dict):
        """Log system metrics."""
        self.logger.info(
            self._format_log(
                "System metrics",
                {"metrics": metrics}
            )
        ) 