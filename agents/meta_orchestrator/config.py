from typing import Dict
from pathlib import Path
import os

# Base directory for all data storage
BASE_DIR = Path(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
DATA_DIR = BASE_DIR / "data"

# LLM Configuration
LLM_CONFIG = {
    "model": "claude-2.1",
    "temperature": 0.7,
    "max_tokens": 4096,
    "api_key": os.getenv("ANTHROPIC_API_KEY")  # Get API key from environment variable
}

# System Configuration
SYSTEM_CONFIG = {
    "log_level": "INFO",
    "max_retries": 3,
    "timeout": 300,  # seconds
    "safety_checks": {
        "high_risk_operations": True,
        "user_approval_required": True,
        "max_concurrent_tasks": 5
    }
}

# Module Configuration
MODULE_CONFIG = {
    "tool_builder": {
        "enabled": True,
        "max_tools": 10,
        "tool_types": ["search", "calculate", "analyze"]
    },
    "co_scientist": {
        "enabled": True,
        "specializations": ["research", "analysis", "writing"]
    }
}

# Module Communication Configuration
COMMUNICATION_CONFIG = {
    "message_timeout": 60,  # seconds
    "max_message_size": 1024 * 1024,  # 1MB
    "retry_interval": 5  # seconds
}

# State Management Configuration
STATE_CONFIG = {
    "max_history_size": 1000,
    "state_cleanup_interval": 3600,  # 1 hour
}

# Persistence Configuration
PERSISTENCE_CONFIG = {
    "enabled": True,
    "storage_path": str(DATA_DIR / "state")
}

def get_config() -> Dict:
    """Get the combined configuration."""
    return {
        "llm": LLM_CONFIG,
        "system": SYSTEM_CONFIG,
        "modules": MODULE_CONFIG,
        "communication": COMMUNICATION_CONFIG,
        "state": STATE_CONFIG,
        "persistence": PERSISTENCE_CONFIG
    } 