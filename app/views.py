"""
Definition of views.
"""

from datetime import datetime
from django.shortcuts import render, redirect
from django.http import HttpRequest, JsonResponse
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
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
    print("\n=== Research View Called ===")
    print(f"Method: {request.method}")
    print(f"User: {request.user}")
    
    if request.method == 'POST':
        try:
            print("Processing POST request...")
            print(f"Content Type: {request.content_type}")
            body_content = request.body.decode('utf-8')
            print(f"Raw Body Content: {body_content}")
            
            data = json.loads(body_content)
            print(f"Parsed Data: {data}")
            
            # Validate required fields
            required_fields = ['title', 'goals', 'context', 'scope', 'methodology', 'timeline']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                print(f"Error: Missing fields - {missing_fields}")
                return JsonResponse({
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=400)
            
            # Create the research object
            research = Research.objects.create(
                title=data['title'],
                goals=data['goals'],
                context=data['context'],
                scope=data['scope'],
                methodology=data['methodology'],
                timeline=data['timeline'],
                resources=data.get('resources', ''),
                hypotheses=data.get('hypotheses', []),
                created_by=request.user
            )
            print(f"Created Research Object - ID: {research.id}")
            
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
            print(f"Sending Response: {response_data}")
            return JsonResponse(response_data)
            
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': f'Invalid JSON data: {str(e)}'
            }, status=400)
        except Exception as e:
            print(f"Unexpected Error: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            }, status=400)
    else:
        research_projects = Research.objects.filter(created_by=request.user).values(
            'id', 'title', 'goals', 'status', 'progress', 'created_at', 'updated_at'
        )
        print(f"Found {len(research_projects)} research projects for user")
        return render(request, 'main/research.html', {'research_projects': research_projects})

@login_required
def chat(request):
    return render(request, 'main/chat.html')

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
        return JsonResponse({
            'id': research.id,
            'title': research.title,
            'goals': research.goals,
            'context': research.context,
            'scope': research.scope,
            'methodology': research.methodology,
            'timeline': research.timeline,
            'resources': research.resources,
            'hypotheses': research.hypotheses,
            'status': research.status,
            'progress': research.progress,
            'created_at': research.created_at.strftime('%Y-%m-%d'),
            'updated_at': research.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    except Research.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Research not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
