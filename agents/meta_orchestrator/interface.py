from typing import Dict, Any
from datetime import datetime
import json

from .orchestrator import MetaOrchestrator
from .state import ModuleType, MessageType, Message

class MetaOrchestratorInterface:
    """Interface for connecting Meta-Orchestrator with the chat UI."""
    
    def __init__(self):
        self.orchestrator = MetaOrchestrator()
        self._session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    def _serialize_response(self, obj: Any) -> Any:
        """Serialize objects for JSON response."""
        if isinstance(obj, (ModuleType, MessageType)):
            return str(obj.value)
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, dict):
            return {k: self._serialize_response(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self._serialize_response(item) for item in obj]
        return obj

    def process_chat_message(self, message: str, context: Dict[str, Any] = None) -> Dict:
        """Process a chat message and return the response."""
        try:
            print(f"\n=== Processing Chat Message ===")
            print(f"Message: {message}")
            print(f"Context: {context}")
            
            request = {
                "type": "chat_message",
                "content": message,
                "timestamp": datetime.now().isoformat(),
                "session_id": self._session_id,
                "context": context or {}
            }
            
            print(f"\n=== Running Orchestrator ===")
            print(f"Request: {request}")
            
            # Run the orchestrator
            result = self.orchestrator.run(request)
            
            print(f"\n=== Orchestrator Result ===")
            print(f"Status: {result['status']}")
            print(f"Metrics: {result.get('metrics', {})}")
            
            # Extract relevant information for the chat UI
            if result["status"] == "completed" and "final_state" in result:
                final_state = result["final_state"]
                
                print(f"\n=== Processing Final State ===")
                print(f"State Keys: {list(final_state.keys())}")
                
                # Get messages from the final state
                system_state = final_state.get("system_state", {})
                messages = system_state.get("messages", [])
                
                print(f"Messages Count: {len(messages)}")
                print(f"Message Types: {[getattr(m, 'type', None) for m in messages]}")
                
                # Find the most recent response message
                response_message = None
                for msg in reversed(messages):
                    if isinstance(msg, Message) and msg.type == MessageType.RESPONSE:
                        response_message = msg
                        print(f"\n=== Found Response Message ===")
                        print(f"Content: {msg.content}")
                        print(f"Type: {msg.type}")
                        print(f"From: {msg.from_module}")
                        break
                
                if response_message:
                    response = {
                        "status": "success",
                        "message": response_message.content,
                        "metadata": {
                            "source": response_message.from_module.value,
                            "type": response_message.type.value,
                            "timestamp": response_message.timestamp.isoformat(),
                            **response_message.metadata
                        }
                    }
                else:
                    print("\n=== No Response Message Found ===")
                    print(f"All Messages:")
                    for idx, msg in enumerate(messages):
                        print(f"\nMessage {idx}:")
                        print(f"Type: {getattr(msg, 'type', 'Unknown')}")
                        print(f"Content: {getattr(msg, 'content', 'No content')}")
                    
                    response = {
                        "status": "error",
                        "message": "No response was generated",
                        "metadata": {
                            "source": ModuleType.META_ORCHESTRATOR.value,
                            "type": MessageType.ERROR.value,
                            "timestamp": datetime.now().isoformat(),
                            "debug_info": {
                                "messages_count": len(messages),
                                "state_keys": list(final_state.keys()),
                                "system_state_keys": list(system_state.keys())
                            }
                        }
                    }
            else:
                print("\n=== Error in Result ===")
                print(f"Error: {result.get('error', 'Unknown error')}")
                
                error_msg = result.get("error", "Unknown error")
                response = {
                    "status": "error",
                    "message": f"Error processing request: {error_msg}",
                    "metadata": {
                        "source": ModuleType.META_ORCHESTRATOR.value,
                        "type": MessageType.ERROR.value,
                        "timestamp": datetime.now().isoformat(),
                        "error_details": error_msg
                    }
                }
            
            # Add metrics and serialize the entire response
            response["metrics"] = result.get("metrics", {})
            return self._serialize_response(response)
            
        except Exception as e:
            print(f"\n=== Exception in process_chat_message ===")
            print(f"Error: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            
            return {
                "status": "error",
                "message": f"Internal error: {str(e)}",
                "metadata": {
                    "source": ModuleType.META_ORCHESTRATOR.value,
                    "type": MessageType.ERROR.value,
                    "timestamp": datetime.now().isoformat()
                },
                "metrics": self.orchestrator.metrics_collector.get_metrics()
            }
    
    def get_session_info(self) -> Dict:
        """Get information about the current session."""
        return {
            "session_id": self._session_id,
            "start_time": self._session_id,
            "metrics": self.orchestrator.metrics_collector.get_metrics()
        }
    
    def reset_session(self):
        """Reset the current session."""
        self._session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.orchestrator.metrics_collector.reset_metrics() 