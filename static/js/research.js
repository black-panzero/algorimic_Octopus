document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const createResearchBtn = document.querySelector('.create-research-btn');
    const createResearchModal = document.getElementById('createResearchModal');
    const researchPreviewModal = document.getElementById('researchPreviewModal');
    const researchDetailsModal = document.getElementById('researchDetailsModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const researchForm = document.getElementById('researchForm');
    const notificationToast = document.getElementById('notificationToast');
    const toastCloseBtn = document.querySelector('.toast-close');

    // Modal functionality
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Add click event listener for create research button
    if (createResearchBtn) {
        createResearchBtn.addEventListener('click', function() {
            console.log('Create research button clicked');
            openModal(createResearchModal);
        });
    }

    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Hypothesis management
    window.addHypothesis = function() {
        const hypothesesList = document.getElementById('hypothesesList');
        const hypothesisItem = document.createElement('div');
        hypothesisItem.className = 'hypothesis-item';
        hypothesisItem.innerHTML = `
            <input type="text" class="hypothesis-input" name="hypotheses[]" placeholder="Enter a hypothesis">
            <button type="button" class="remove-hypothesis" onclick="removeHypothesis(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        hypothesesList.appendChild(hypothesisItem);
    };

    window.removeHypothesis = function(button) {
        const hypothesisItem = button.closest('.hypothesis-item');
        hypothesisItem.remove();
    };

    // Research preview
    function previewResearch() {
        // Get form data
        const title = document.getElementById('researchTitle').value;
        const goals = document.getElementById('researchGoals').value;
        const context = document.getElementById('researchContext').value;
        const scope = document.getElementById('researchScope').value;
        const methodology = document.getElementById('researchMethodology').value;
        const timeline = document.getElementById('researchTimeline').value;
        const resources = document.getElementById('researchResources').value;
        
        // Get hypotheses
        const hypotheses = Array.from(document.querySelectorAll('.hypothesis-input'))
            .map(input => input.value)
            .filter(value => value.trim() !== '');

        // Update preview content
        document.getElementById('previewTitle').textContent = title;
        document.getElementById('previewGoals').textContent = goals;
        document.getElementById('previewContext').textContent = context;
        document.getElementById('previewScope').textContent = scope;
        document.getElementById('previewMethodology').textContent = methodology;
        document.getElementById('previewTimeline').textContent = timeline;
        document.getElementById('previewResources').textContent = resources;

        const hypothesesList = document.getElementById('previewHypotheses');
        hypothesesList.innerHTML = '';
        hypotheses.forEach(hypothesis => {
            const li = document.createElement('li');
            li.textContent = hypothesis;
            hypothesesList.appendChild(li);
        });

        // Show preview modal
        closeModal(createResearchModal);
        openModal(researchPreviewModal);
    }

    // Close preview and return to edit
    window.closePreviewAndEdit = function() {
        closeModal(researchPreviewModal);
        openModal(createResearchModal);
    };

    // Submit research
    window.submitResearch = function() {
        console.log('Starting research submission...');
        
        // Get CSRF token
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        if (!csrftoken) {
            showNotification('CSRF token not found. Please refresh the page.', 'error');
            return;
        }
        
        // Get form data
        const form = document.getElementById('researchForm');
        const formData = new FormData(form);
        
        // Convert FormData to JSON object
        const researchData = {
            title: formData.get('title'),
            goals: formData.get('goals'),
            context: formData.get('context'),
            scope: formData.get('scope'),
            methodology: formData.get('methodology'),
            timeline: formData.get('timeline'),
            resources: formData.get('resources') || '',
            hypotheses: Array.from(document.querySelectorAll('.hypothesis-input'))
                .map(input => input.value)
                .filter(value => value.trim() !== '')
        };

        // Validate required fields
        const requiredFields = ['title', 'goals', 'context', 'scope', 'methodology', 'timeline'];
        const missingFields = requiredFields.filter(field => !researchData[field]);
        if (missingFields.length > 0) {
            showNotification(`Missing required fields: ${missingFields.join(', ')}`, 'error');
            return;
        }

        // Disable submit button to prevent double submission
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        // Send data to backend
        fetch('/research/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(researchData),
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                // Add the new research card to the list
                addResearchCard(data.research);
                
                // Show success notification
                showNotification('Research project created successfully!', 'success');
                
                // Close all modals
                closeModal(createResearchModal);
                closeModal(researchPreviewModal);
                
                // Reset form
                form.reset();
                
                // Clear hypotheses except for the first one
                const hypothesesList = document.getElementById('hypothesesList');
                const firstHypothesis = hypothesesList.querySelector('.hypothesis-item');
                hypothesesList.innerHTML = '';
                hypothesesList.appendChild(firstHypothesis);
                firstHypothesis.querySelector('.hypothesis-input').value = '';
            } else {
                throw new Error(data.message || 'Failed to create research project');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification(error.message, 'error');
        })
        .finally(() => {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Research';
        });
    };

    // Initialize progress bars
    function initializeProgressBars() {
        document.querySelectorAll('.progress').forEach(progressBar => {
            const progress = progressBar.getAttribute('data-progress');
            progressBar.style.width = `${progress}%`;
        });
    }

    // Call initialize on page load
    initializeProgressBars();

    // Update addResearchCard function
    function addResearchCard(researchData) {
        try {
            console.log('Adding research card...');
            const projectsList = document.querySelector('.projects-list');
            
            // Remove "no research" message if it exists
            const noResearchMessage = document.querySelector('.no-research');
            if (noResearchMessage) {
                console.log('Removing no research message');
                noResearchMessage.remove();
            }

            const card = document.createElement('div');
            card.className = 'research-card';
            card.innerHTML = `
                <div class="research-card-header">
                    <h3>${researchData.title}</h3>
                    <span class="status-badge in-progress">In Progress</span>
                </div>
                <p>${researchData.goals}</p>
                <div class="research-meta">
                    <span><i class="fas fa-calendar"></i> Started: ${researchData.created_at}</span>
                    <span><i class="fas fa-clock"></i> Last Updated: ${researchData.updated_at}</span>
                </div>
                <div class="research-progress">
                    <div class="progress-bar">
                        <div class="progress" data-progress="${researchData.progress || 0}"></div>
                    </div>
                    <span class="progress-text">${researchData.progress || 0}% Complete</span>
                </div>
                <div class="research-actions">
                    <button class="view-research-btn" onclick="viewResearch(${researchData.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="track-progress-btn" onclick="trackProgress(${researchData.id})">
                        <i class="fas fa-chart-line"></i> Track Progress
                    </button>
                </div>
            `;
            projectsList.insertBefore(card, projectsList.firstChild);
            initializeProgressBars();
            console.log('Research card added successfully');
        } catch (error) {
            console.error('Error adding research card:', error);
        }
    }

    let currentProjectId = null;
    let currentProjectTitle = null;

    // View research details
    window.viewResearch = function(researchId) {
        currentProjectId = researchId;
        
        fetch(`/research/${researchId}/`)
            .then(response => response.json())
            .then(researchDetails => {
                currentProjectTitle = researchDetails.title;
                // Update view details modal
                document.getElementById('viewDetailsTitle').textContent = researchDetails.title;
                document.getElementById('viewDetailsStatus').textContent = researchDetails.status;
                document.getElementById('viewDetailsStatus').className = `status-badge ${researchDetails.status}`;

                // Update metadata
                document.getElementById('viewDetailsCreated').textContent = `Created: ${researchDetails.created_at}`;
                document.getElementById('viewDetailsUpdated').textContent = `Last Updated: ${researchDetails.updated_at}`;

                // Update content
                document.getElementById('viewDetailsGoals').textContent = researchDetails.goals;
                document.getElementById('viewDetailsContext').textContent = researchDetails.context;
                document.getElementById('viewDetailsScope').textContent = researchDetails.scope;
                document.getElementById('viewDetailsMethodology').textContent = researchDetails.methodology;
                document.getElementById('viewDetailsTimeline').textContent = researchDetails.timeline;
                document.getElementById('viewDetailsResources').textContent = researchDetails.resources || 'No resources specified';

                // Update hypotheses
                const hypothesesList = document.getElementById('viewDetailsHypotheses');
                hypothesesList.innerHTML = '';
                if (researchDetails.hypotheses && researchDetails.hypotheses.length > 0) {
                    researchDetails.hypotheses.forEach(hypothesis => {
                        const li = document.createElement('li');
                        li.textContent = hypothesis;
                        hypothesesList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'No hypotheses specified';
                    hypothesesList.appendChild(li);
                }

                // Show modal
                const viewDetailsModal = document.getElementById('viewDetailsModal');
                if (viewDetailsModal) {
                    viewDetailsModal.style.display = 'block';
                }
            })
            .catch(error => {
                showNotification('Error fetching research details', 'error');
            });
    };

    // Also move these functions to global scope
    window.showDeleteConfirmation = function() {
        document.getElementById('deleteProjectTitle').textContent = currentProjectTitle;
        document.getElementById('deleteConfirmation').style.display = 'block';
    };

    window.hideDeleteConfirmation = function() {
        document.getElementById('deleteConfirmation').style.display = 'none';
    };

    // Helper function to get CSRF token
    window.getCookie = function(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    // Show notification
    window.showNotification = function(message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toast.className = `notification-toast ${type}`;
        toastMessage.textContent = message;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    };

    window.deleteProject = function() {
        if (!currentProjectId) {
            console.error('No project ID available for deletion');
            showNotification('Error: No project ID available', 'error');
            return;
        }

        const csrftoken = getCookie('csrftoken');
        if (!csrftoken) {
            console.error('CSRF token not found');
            showNotification('Error: CSRF token not found', 'error');
            return;
        }

        console.log('Attempting to delete project:', currentProjectId);
        
        fetch(`/research/${currentProjectId}/`, {  // Changed to match Django's URL pattern
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        })
        .then(response => {
            console.log('Delete response status:', response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server responded with ${response.status}: ${text}`);
                });
            }
            // Find and remove the project card
            const projectCard = document.querySelector(`.research-card:has(button[onclick*="viewResearch(${currentProjectId})"])`);
            if (projectCard) {
                projectCard.remove();
            } else {
                console.warn('Project card not found in DOM');
                // If we can't find the card, reload the page
                window.location.reload();
            }

            // Close both modals
            hideDeleteConfirmation();
            document.getElementById('viewDetailsModal').style.display = 'none';
            
            showNotification('Project deleted successfully', 'success');
        })
        .catch(error => {
            console.error('Error during deletion:', error);
            showNotification(`Error deleting project: ${error.message}`, 'error');
        });
    };

    // Track research progress
    window.trackProgress = function(researchId) {
        // Fetch research details from backend
        fetch(`/research/${researchId}/`)
        .then(response => response.json())
        .then(researchDetails => {
            // Update research details modal
            document.getElementById('researchDetailsTitle').textContent = researchDetails.title;
            document.getElementById('researchDetailsStatus').textContent = researchDetails.status;
            document.getElementById('researchDetailsStatus').className = `status-badge ${researchDetails.status}`;

            // Update timeline
            const timelineItems = document.querySelectorAll('.timeline-item');
            timelineItems.forEach((item, index) => {
                item.classList.remove('active');
                if (researchDetails.timeline[index]?.status === 'completed') {
                    item.classList.add('completed');
                } else if (researchDetails.timeline[index]?.status === 'current') {
                    item.classList.add('active');
                }
            });

            // Show modal
            openModal(researchDetailsModal);
        })
        .catch(error => {
            showNotification('Error: ' + error.message, 'error');
        });
    };

    toastCloseBtn.addEventListener('click', function() {
        notificationToast.classList.remove('show');
    });

    function deleteResearch(researchId) {
        // Get the CSRF token from the cookie
        const csrftoken = getCookie('csrftoken');
        
        // Show confirmation popup
        const confirmPopup = document.getElementById('deleteConfirmPopup');
        confirmPopup.style.display = 'block';
        
        // Handle confirm button click
        document.getElementById('confirmDelete').onclick = async function() {
            try {
                const response = await fetch(`/research/${researchId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrftoken
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Close the confirmation popup and view details modal
                    confirmPopup.style.display = 'none';
                    document.getElementById('viewDetailsModal').style.display = 'none';
                    
                    // Remove the research card from the UI
                    const researchCard = document.querySelector(`.research-card[data-id="${researchId}"]`);
                    if (researchCard) {
                        researchCard.remove();
                    }
                    
                    // Show success notification
                    showNotification('success', 'Research project deleted successfully');
                    
                    // If no research cards left, show the "no research" message
                    const researchCards = document.querySelectorAll('.research-card');
                    if (researchCards.length === 0) {
                        const projectsList = document.querySelector('.projects-list');
                        projectsList.innerHTML = `
                            <div class="no-research">
                                <p>No research projects yet. Click "New Research" to create your first project.</p>
                            </div>
                        `;
                    }
                } else {
                    throw new Error(data.message || 'Failed to delete research project');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('error', error.message);
            }
        };
        
        // Handle cancel button click
        document.getElementById('cancelDelete').onclick = function() {
            confirmPopup.style.display = 'none';
        };
    }
}); 