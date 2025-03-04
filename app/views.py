"""
Definition of views.
"""

from datetime import datetime
from django.shortcuts import render, redirect
from django.http import HttpRequest, JsonResponse
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.db import transaction
from .models import Research
import json
import logging

def home(request):
    """Renders the home page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/index.html',
        {
            'title':'Home Page',
            'year':datetime.now().year,
        }
    )

def contact(request):
    """Renders the contact page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/contact.html',
        {
            'title':'Contact',
            'message':'Your contact page.',
            'year':datetime.now().year,
        }
    )

def about(request):
    """Renders the about page."""
    assert isinstance(request, HttpRequest)
    return render(
        request,
        'app/about.html',
        {
            'title':'About',
            'message':'Your application description page.',
            'year':datetime.now().year,
        }
    )

def landing(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'landing.html')

def signup(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})

@login_required
def dashboard(request):
    return render(request, 'main/dashboard.html')

@login_required
def research(request):
    logger = logging.getLogger(__name__)
    logger.info("\n=== Research View Called ===")
    logger.info(f"Method: {request.method}")
    logger.info(f"User: {request.user}")
    
    if request.method == 'POST':
        try:
            logger.info("Processing POST request...")
            logger.info(f"Content Type: {request.content_type}")
            logger.info(f"Request Body: {request.body.decode('utf-8')}")
            data = json.loads(request.body)
            logger.info(f"Parsed Data: {data}")
            
            # Validate required fields
            required_fields = ['title', 'goals', 'context', 'scope', 'methodology', 'timeline']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                logger.error(f"Error: Missing fields - {missing_fields}")
                return JsonResponse({
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=400)
            
            try:
                with transaction.atomic():
                    # Create and save the research object
                    research = Research(
                        title=data['title'],
                        goals=data['goals'],
                        context=data['context'],
                        scope=data['scope'],
                        methodology=data['methodology'],
                        timeline=data['timeline'],
                        resources=data.get('resources', ''),
                        hypotheses='\n'.join(data.get('hypotheses', [])),
                        created_by=request.user,
                        status='in_progress',
                        progress=0
                    )
                    logger.info(f"About to save Research Object with title: {research.title}")
                    research.save()
                    logger.info(f"Created and saved Research Object - ID: {research.id}")
                    
                    # Verify the object was saved by forcing a database read
                    saved_research = Research.objects.select_for_update().get(id=research.id)
                    logger.info(f"Successfully verified Research Object in database - ID: {saved_research.id}")
                    logger.info(f"Verified research title: {saved_research.title}")
                    
                    response_data = {
                        'status': 'success',
                        'research': {
                            'id': research.id,
                            'title': research.title,
                            'goals': research.goals,
                            'status': research.status,
                            'progress': research.progress,
                            'created_at': research.created_at.strftime('%Y-%m-%d'),
                            'updated_at': research.updated_at.strftime('%Y-%m-%d %H:%M:%S')
                        }
                    }
                    logger.info(f"Sending Response: {response_data}")
                    return JsonResponse(response_data)
                
            except Research.DoesNotExist:
                logger.error("Failed to verify research object - not found in database after save!")
                return JsonResponse({
                    'status': 'error',
                    'message': 'Failed to verify research was saved'
                }, status=500)
            except Exception as e:
                logger.error(f"Database Error: {str(e)}", exc_info=True)
                return JsonResponse({
                    'status': 'error',
                    'message': f'Failed to save to database: {str(e)}'
                }, status=500)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {str(e)}", exc_info=True)
            return JsonResponse({
                'status': 'error',
                'message': f'Invalid JSON data: {str(e)}'
            }, status=400)
        except Exception as e:
            logger.error(f"Unexpected Error: {str(e)}", exc_info=True)
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=500)
    else:
        research_projects = Research.objects.filter(created_by=request.user).order_by('-created_at')
        print(f"Found {len(research_projects)} research projects for user")
        return render(request, 'main/research.html', {'research_projects': research_projects})

@login_required
def chat(request):
    """Renders the chat interface with Meta-Orchestrator integration."""
    return render(request, 'chat/chat.html')

@login_required
def agents(request):
    return render(request, 'agents/agents.html')

@login_required
def tools(request):
    return render(request, 'tools/tools.html')

@login_required
def settings(request):
    return render(request, 'main/settings.html')

@login_required
def research_detail(request, research_id):
    try:
        research = Research.objects.get(id=research_id, created_by=request.user)
        
        if request.method == 'DELETE':
            research.delete()
            return JsonResponse({'status': 'success', 'message': 'Research project deleted successfully'})
            
        return JsonResponse({
            'id': research.id,
            'title': research.title,
            'goals': research.goals,
            'context': research.context,
            'scope': research.scope,
            'methodology': research.methodology,
            'timeline': research.timeline,
            'resources': research.resources,
            'hypotheses': research.hypotheses.split('\n') if research.hypotheses else [],
            'status': research.status,
            'progress': research.progress,
            'created_at': research.created_at.strftime('%Y-%m-%d'),
            'updated_at': research.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    except Research.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Research not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
