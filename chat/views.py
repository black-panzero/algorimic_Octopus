from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime

from agents.meta_orchestrator import MetaOrchestratorInterface
from .models import ChatSession, ChatMessage, SystemMetrics, SystemState

class ChatManager:
    def __init__(self):
        self.orchestrator = MetaOrchestratorInterface()
    
    def _serialize_for_json(self, obj):
        """Ensure all objects are JSON serializable."""
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, dict):
            return {k: self._serialize_for_json(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self._serialize_for_json(item) for item in obj]
        return str(obj) if hasattr(obj, '__dict__') else obj
    
    def process_message(self, session_id, message_content):
        """Process a message through the Meta-Orchestrator and store in database."""
        # Get or create session
        session, created = ChatSession.objects.get_or_create(session_id=session_id)
        
        # Store user message
        user_message = ChatMessage.objects.create(
            session=session,
            content=message_content,
            message_type='user'
        )
        
        # Process through Meta-Orchestrator
        response = self.orchestrator.process_chat_message(
            message_content,
            context={"session_id": str(session_id)}
        )
        
        # Ensure metadata is JSON serializable
        metadata = self._serialize_for_json(response.get("metadata", {}))
        metrics = self._serialize_for_json(response.get("metrics", {}))
        
        # Store assistant response
        assistant_message = ChatMessage.objects.create(
            session=session,
            content=response["message"],
            message_type='assistant',
            metadata=metadata
        )
        
        # Store metrics
        if metrics:
            SystemMetrics.objects.create(
                session=session,
                metrics_data=metrics
            )
        
        return {
            "user_message": user_message,
            "assistant_message": assistant_message,
            "metadata": metadata,
            "metrics": metrics
        }

# Initialize chat manager
chat_manager = ChatManager()

def chat_home(request):
    """Render the chat interface."""
    return render(request, 'chat/chat.html')

@csrf_exempt
@require_http_methods(["POST"])
def process_message(request):
    """Handle incoming chat messages."""
    try:
        data = json.loads(request.body)
        message = data.get('message')
        session_id = data.get('session_id')
        
        if not message:
            return JsonResponse({"error": "Message is required"}, status=400)
        
        # Process message through chat manager
        result = chat_manager.process_message(session_id, message)
        
        return JsonResponse({
            "status": "success",
            "response": result["assistant_message"].content,
            "metadata": result["metadata"],
            "metrics": result["metrics"]
        })
        
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "error": str(e)
        }, status=500)

@require_http_methods(["GET"])
def get_chat_history(request, session_id):
    """Retrieve chat history for a session."""
    try:
        messages = ChatMessage.objects.filter(
            session__session_id=session_id
        ).order_by('created_at')
        
        history = [{
            "content": msg.content,
            "type": msg.message_type,
            "timestamp": msg.created_at.isoformat(),
            "metadata": msg.metadata
        } for msg in messages]
        
        return JsonResponse({
            "status": "success",
            "history": history
        })
        
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "error": str(e)
        }, status=500)

@require_http_methods(["GET"])
def get_system_metrics(request, session_id):
    """Retrieve system metrics for a session."""
    try:
        metrics = SystemMetrics.objects.filter(
            session__session_id=session_id
        ).order_by('-timestamp')[:10]
        
        data = [{
            "timestamp": m.timestamp.isoformat(),
            "data": m.metrics_data
        } for m in metrics]
        
        return JsonResponse({
            "status": "success",
            "metrics": data
        })
        
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "error": str(e)
        }, status=500) 