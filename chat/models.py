from django.db import models
from django.utils import timezone
import uuid

class ChatSession(models.Model):
    """Represents a chat session with the Meta-Orchestrator."""
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict)
    
    class Meta:
        ordering = ['-last_activity']

class ChatMessage(models.Model):
    """Represents individual messages in a chat session."""
    MESSAGE_TYPES = [
        ('user', 'User Message'),
        ('assistant', 'Assistant Message'),
        ('system', 'System Message'),
        ('error', 'Error Message')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)
    
    class Meta:
        ordering = ['created_at']

class SystemMetrics(models.Model):
    """Stores system metrics and performance data."""
    timestamp = models.DateTimeField(default=timezone.now)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='metrics')
    metrics_data = models.JSONField()
    
    class Meta:
        ordering = ['-timestamp']

class SystemState(models.Model):
    """Stores system state snapshots."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='states')
    state_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at'] 