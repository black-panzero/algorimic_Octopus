from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.chat_home, name='home'),
    path('process/', views.process_message, name='process_message'),
    path('history/<uuid:session_id>/', views.get_chat_history, name='chat_history'),
    path('metrics/<uuid:session_id>/', views.get_system_metrics, name='system_metrics'),
] 