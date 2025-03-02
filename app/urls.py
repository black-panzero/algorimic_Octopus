from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('signup/', views.signup, name='signup'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('research/', views.research, name='research'),
    path('chat/', views.chat, name='chat'),
    path('agents/', views.agents, name='agents'),
    path('tools/', views.tools, name='tools'),
    path('settings/', views.settings, name='settings'),
] 