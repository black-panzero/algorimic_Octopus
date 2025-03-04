from django.apps import AppConfig

class ChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chat'
    verbose_name = 'Chat'
    
    def ready(self):
        """Initialize any app-specific settings or signals."""
        pass 