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
        const csrftoken = getCookie('csrftoken');
        console.log('CSRF Token:', csrftoken);
        
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
            resources: formData.get('resources'),
            hypotheses: Array.from(document.querySelectorAll('.hypothesis-input'))
                .map(input => input.value)
                .filter(value => value.trim() !== '')
        };

        console.log('Form data to submit:', researchData);

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
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.status === 'success') {
                // Show success notification
                showNotification('Research project has been initialized successfully!');

                // Close modals and reset form
                closeModal(createResearchModal);
                form.reset();
                
                console.log('Adding research card with data:', data.research);
                // Add new research card to the list
                addResearchCard(data.research);
            } else {
                console.error('Error response:', data);
                showNotification('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            showNotification('Error: ' + error.message, 'error');
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

    // View research details
    window.viewResearch = function(researchId) {
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
                if (researchDetails.timeline[index].status === 'completed') {
                    item.classList.add('completed');
                } else if (researchDetails.timeline[index].status === 'current') {
                    item.classList.add('active');
                }
            });

            // Update content
            const contentDiv = document.getElementById('researchDetailsContent');
            contentDiv.innerHTML = `
                <div class="content-section">
                    <h4>Goals</h4>
                    <p>${researchDetails.goals}</p>
                </div>
                <div class="content-section">
                    <h4>Context</h4>
                    <p>${researchDetails.context}</p>
                </div>
                <div class="content-section">
                    <h4>Scope</h4>
                    <p>${researchDetails.scope}</p>
                </div>
                <div class="content-section">
                    <h4>Methodology</h4>
                    <p>${researchDetails.methodology}</p>
                </div>
                <div class="content-section">
                    <h4>Hypotheses</h4>
                    <ul>
                        ${researchDetails.hypotheses.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
            `;

            // Show modal
            openModal(researchDetailsModal);
        })
        .catch(error => {
            showNotification('Error: ' + error.message, 'error');
        });
    };

    // Track research progress
    window.trackProgress = function(researchId) {
        // Here you would typically fetch progress data from your backend
        console.log('Tracking progress for:', researchId);
        // For now, just show the research details
        viewResearch(researchId);
    };

    // Helper function to get CSRF token
    function getCookie(name) {
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
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toast.className = `notification-toast ${type}`;
        toastMessage.textContent = message;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    toastCloseBtn.addEventListener('click', function() {
        notificationToast.classList.remove('show');
    });
}); 