from typing import Literal, Dict, List
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command
import time
import os
from dotenv import load_dotenv

from anthropic import Anthropic
from .state import MetaOrchestratorState, SystemState, Message, ModuleType, MessageType
from .config import get_config
from .logger import MetaOrchestratorLogger
from .utils import SafetyChecker, StateManager, MetricsCollector

class MetaOrchestrator:
    def __init__(self):
        """Initialize the Meta-Orchestrator."""
        # Load configuration
        self.config = get_config()
        
        # Initialize components
        self.logger = MetaOrchestratorLogger(log_level=self.config["system"]["log_level"])
        self.state_manager = StateManager(config=self.config)
        self.safety_checker = SafetyChecker(config=self.config)
        self.metrics_collector = MetricsCollector()
        
        # Initialize Anthropic client
        self.model = Anthropic(
            api_key=self.config["llm"]["api_key"]
        ).messages.create
        
        # Build the control flow graph
        self.graph = self._build_graph()
        
    def _build_graph(self) -> StateGraph:
        """Build the Meta-Orchestrator's control flow graph."""
        builder = StateGraph(MetaOrchestratorState)
        
        # Add core nodes
        builder.add_node("process_request", self.process_request)
        builder.add_node("coordinate_modules", self.coordinate_modules)
        builder.add_node("handle_error", self.handle_error)
        builder.add_node("idle", self.idle_state)
        
        # Define edges with clearer flow control
        builder.add_edge(START, "process_request")
        builder.add_edge("process_request", "coordinate_modules")
        builder.add_edge("coordinate_modules", "idle")
        builder.add_edge("process_request", "handle_error")
        builder.add_edge("handle_error", "idle")
        builder.add_edge("process_request", "idle")
        builder.add_edge("idle", END)
        
        return builder.compile()

    def process_request(self, state: MetaOrchestratorState) -> Command[Literal["coordinate_modules", "handle_error", "idle"]]:
        """Process incoming requests and determine next action."""
        try:
            if not state["pending_requests"]:
                return Command(goto="idle")

            current_request = state["pending_requests"][0]
            
            # Fast path for chat messages
            if current_request["type"] == "chat_message":
                try:
                    # Get response from Claude with a single API call
                    response = self.model(
                        model=self.config["llm"]["model"],
                        max_tokens=self.config["llm"]["max_tokens"],
                        temperature=self.config["llm"]["temperature"],
                        messages=[{
                            "role": "user",
                            "content": f"""You are Claude, an AI assistant. Respond to the following message:
                            {current_request['content']}
                            
                            Provide a helpful, informative, and engaging response."""
                        }]
                    )
                    response_content = response.content[0].text
                    
                    # Update metrics
                    self.metrics_collector.update_metrics("request_processed")
                    self.metrics_collector.update_metrics("successful_responses")
                    
                    # Create new state with minimal updates
                    new_state = {
                        **state,
                        "pending_requests": state["pending_requests"][1:],
                        "system_state": {
                            **state["system_state"],
                            "messages": [
                                *state["system_state"]["messages"],
                                Message(
                                    type=MessageType.RESPONSE,
                                    content=response_content,
                                    from_module=ModuleType.META_ORCHESTRATOR,
                                    to_module=ModuleType.META_ORCHESTRATOR,
                                    metadata={"chat_response": True}
                                )
                            ],
                            "metrics": self.metrics_collector.get_metrics()
                        }
                    }
                    
                    # Only save state if persistence is enabled and successful
                    if self.config["persistence"]["enabled"]:
                        try:
                            self.state_manager.save_state(new_state["system_state"], f"chat_{time.time()}")
                        except Exception as e:
                            # Log error but continue - state saving is not critical for chat
                            self.logger.log_error(e, {"context": "Failed to save chat state"})
                    
                    return Command(goto="idle", update=new_state)
                    
                except Exception as e:
                    # Log error but don't trigger error recovery for chat messages
                    self.logger.log_error(e, {"context": "Chat processing error"})
                    self.metrics_collector.update_metrics("error")
                    return Command(goto="idle")
            
            # Regular path for non-chat requests that need coordination
            safety_check = self.safety_checker.check_operation(
                "process_request",
                {"request": current_request, "active_tasks": len(state["system_state"]["active_modules"])}
            )
            
            if not safety_check["passed"]:
                error_state = {
                    **state,
                    "system_state": {
                        **state["system_state"],
                        "system_logs": [
                            *state["system_state"]["system_logs"],
                            {"error": "Safety check failed", "details": safety_check}
                        ]
                    }
                }
                return Command(goto="handle_error", update=error_state)
            
            # Process complex requests that need coordination
            start_time = time.time()
            response = self.model(
                model=self.config["llm"]["model"],
                max_tokens=self.config["llm"]["max_tokens"],
                temperature=self.config["llm"]["temperature"],
                messages=[{
                    "role": "user",
                    "content": f"""As the Meta-Orchestrator, analyze this request and determine the appropriate action.
                    Current system state: {state}
                    Request: {current_request}
                    
                    Determine:
                    1. Which module should handle this request
                    2. What specific task should be assigned
                    3. Any safety considerations or dependencies
                    
                    Provide your analysis and decision in a structured format."""
                }]
            )
            response_content = response.content[0].text
            
            processing_time = time.time() - start_time
            self.metrics_collector.update_metrics("request_processed")
            
            # Create new message
            task_message = Message(
                type=MessageType.TASK,
                content=response_content,
                from_module=ModuleType.META_ORCHESTRATOR,
                to_module=ModuleType.TOOL_BUILDER,
                metadata={"processing_time": processing_time}
            )
            
            # Update state
            new_state = {
                **state,
                "current_task": current_request,
                "pending_requests": state["pending_requests"][1:],
                "system_state": {
                    **state["system_state"],
                    "messages": [*state["system_state"]["messages"], task_message]
                }
            }
            
            # Save state for non-chat requests
            if self.config["persistence"]["enabled"]:
                try:
                    self.state_manager.save_state(new_state["system_state"], f"request_{time.time()}")
                except Exception as e:
                    self.logger.log_error(e, {"context": "Failed to save request state"})
            
            return Command(goto="coordinate_modules", update=new_state)
            
        except Exception as e:
            self.logger.log_error(e, {"state": state})
            self.metrics_collector.update_metrics("error")
            return Command(goto="idle")

    def coordinate_modules(self, state: MetaOrchestratorState) -> Command[Literal["idle"]]:
        """Coordinate between Tool Builder and AI Co-Scientist modules."""
        try:
            # Use Claude to determine coordination strategy
            response = self.model(
                f"""As the Meta-Orchestrator, determine the coordination strategy between modules.
                Current state: {state}
                Current task: {state['current_task']}
                
                Determine:
                1. How should the modules coordinate on this task
                2. What information needs to be shared
                3. Any synchronization requirements
                
                Provide your strategy in a structured format."""
            )
            
            # Update metrics for module interaction
            self.metrics_collector.update_metrics("module_call", module=ModuleType.TOOL_BUILDER)
            self.metrics_collector.update_metrics("module_call", module=ModuleType.CO_SCIENTIST)
            
            new_state = {
                "system_state": {
                    **state["system_state"],
                    "messages": [
                        *state["system_state"]["messages"],
                        Message(
                            type=MessageType.STATUS,
                            content=str(response.content),
                            from_module=ModuleType.META_ORCHESTRATOR,
                            to_module=ModuleType.CO_SCIENTIST,
                            metadata={"coordination_strategy": True}
                        )
                    ]
                }
            }
            
            # Log coordination decision
            self.logger.log_message({
                "type": "coordination",
                "strategy": response.content
            })
            
            return Command(goto="idle", update=new_state)
            
        except Exception as e:
            self.logger.log_error(e, {"state": state})
            self.metrics_collector.update_metrics("error")
            return Command(goto="idle")

    def handle_error(self, state: MetaOrchestratorState) -> Command[Literal["idle"]]:
        """Handle errors and exceptions."""
        try:
            # Use Claude to analyze error and determine recovery strategy
            error_context = state["system_state"]["system_logs"][-1]
            response = self.model(
                f"""As the Meta-Orchestrator, analyze this error and determine recovery strategy.
                Error: {error_context}
                Current state: {state}
                
                Determine:
                1. Root cause analysis
                2. Recovery steps
                3. Prevention measures
                
                Provide your analysis and strategy in a structured format."""
            )
            
            self.logger.log_message({
                "type": "error_recovery",
                "strategy": response.content
            })
            
            return Command(
                goto="idle",
                update={
                    "safety_flags": {**state["safety_flags"], "error_recovery": True},
                    "system_state": {
                        **state["system_state"],
                        "messages": [
                            *state["system_state"]["messages"],
                            Message(
                                type=MessageType.ERROR,
                                content=str(response.content),
                                from_module=ModuleType.META_ORCHESTRATOR,
                                to_module=ModuleType.META_ORCHESTRATOR,
                                metadata={"error_recovery": True}
                            )
                        ]
                    }
                }
            )
        except Exception as e:
            self.logger.log_error(e, {"state": state, "context": "error_recovery"})
            self.metrics_collector.update_metrics("error")
            return Command(goto="idle")

    def idle_state(self, state: MetaOrchestratorState) -> Command:
        """Handle idle state when no pending requests."""
        # Log final metrics before going idle
        self.logger.log_metrics(self.metrics_collector.get_metrics())
        return Command(goto=END)

    def initialize_state(self) -> MetaOrchestratorState:
        """Initialize the Meta-Orchestrator's state."""
        return {
            "system_state": {
                "messages": [],
                "research_goals": [],
                "active_modules": [str(ModuleType.META_ORCHESTRATOR.value)],
                "system_logs": [],
                "configurations": get_config(),
                "metrics": self.metrics_collector.get_metrics()
            },
            "current_task": None,
            "pending_requests": [],
            "safety_flags": {"error_recovery": False},
            "next_action": "idle"
        }

    def run(self, request: Dict) -> Dict:
        """Run the Meta-Orchestrator with a new request."""
        try:
            print("\n=== Meta-Orchestrator Run Started ===")
            print(f"Request: {request}")
            
            # Initialize state
            state = self.initialize_state()
            state["pending_requests"].append(request)
            
            print("\n=== Initial State ===")
            print(f"Pending Requests: {len(state['pending_requests'])}")
            print(f"System State Keys: {list(state['system_state'].keys())}")
            
            # Log start of processing
            self.logger.log_message({
                "type": "processing_start",
                "request": request
            })
            
            # Execute the graph
            print("\n=== Executing Graph ===")
            start_time = time.time()
            final_state = self.graph.invoke(state)
            processing_time = time.time() - start_time
            
            print("\n=== Graph Execution Complete ===")
            print(f"Processing Time: {processing_time}")
            print(f"Final State Keys: {list(final_state.keys())}")
            if "system_state" in final_state:
                print(f"System State Keys: {list(final_state['system_state'].keys())}")
                print(f"Messages Count: {len(final_state['system_state'].get('messages', []))}")
            
            # Update metrics
            self.metrics_collector.update_metrics(
                "average_processing_time",
                (processing_time - self.metrics_collector.metrics["average_processing_time"]) /
                (self.metrics_collector.metrics["requests_processed"] + 1)
            )
            
            metrics = self.metrics_collector.get_metrics()
            print("\n=== Final Metrics ===")
            print(f"Metrics: {metrics}")
            
            # Log completion
            self.logger.log_message({
                "type": "processing_complete",
                "processing_time": processing_time,
                "metrics": metrics
            })
            
            return {
                "status": "completed",
                "final_state": final_state,
                "metrics": metrics
            }
            
        except Exception as e:
            print("\n=== Exception in Meta-Orchestrator Run ===")
            print(f"Error: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            
            self.logger.log_error(e, {"request": request})
            self.metrics_collector.update_metrics("error")
            return {
                "status": "error",
                "error": str(e),
                "metrics": self.metrics_collector.get_metrics()
            } 