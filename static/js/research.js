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
        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    createResearchBtn.addEventListener('click', function() {
        openModal(createResearchModal);
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Hypothesis management
    function addHypothesis() {
        const hypothesesList = document.getElementById('hypothesesList');
        const hypothesisItem = document.createElement('div');
        hypothesisItem.className = 'hypothesis-item';
        hypothesisItem.innerHTML = `
            <input type="text" class="hypothesis-input" placeholder="Enter a hypothesis">
            <button type="button" class="remove-hypothesis" onclick="removeHypothesis(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        hypothesesList.appendChild(hypothesisItem);
    }

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
        // Get form data
        const researchData = {
            title: document.getElementById('researchTitle').value,
            goals: document.getElementById('researchGoals').value,
            context: document.getElementById('researchContext').value,
            scope: document.getElementById('researchScope').value,
            methodology: document.getElementById('researchMethodology').value,
            timeline: document.getElementById('researchTimeline').value,
            resources: document.getElementById('researchResources').value,
            hypotheses: Array.from(document.querySelectorAll('.hypothesis-input'))
                .map(input => input.value)
                .filter(value => value.trim() !== '')
        };

        // Here you would typically send this data to your backend
        console.log('Submitting research:', researchData);

        // Show success notification
        showNotification('Research project has been initialized successfully!');

        // Close modals and reset form
        closeModal(researchPreviewModal);
        researchForm.reset();
        
        // Add new research card to the list
        addResearchCard(researchData);
    };

    // Add research card to the list
    function addResearchCard(researchData) {
        const projectsList = document.querySelector('.projects-list');
        const card = document.createElement('div');
        card.className = 'research-card';
        card.innerHTML = `
            <div class="research-card-header">
                <h3>${researchData.title}</h3>
                <span class="status-badge in-progress">In Progress</span>
            </div>
            <p>${researchData.goals}</p>
            <div class="research-meta">
                <span><i class="fas fa-calendar"></i> Started: ${new Date().toLocaleDateString()}</span>
                <span><i class="fas fa-clock"></i> Last Updated: Just now</span>
            </div>
            <div class="research-progress">
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
                <span class="progress-text">0% Complete</span>
            </div>
            <div class="research-actions">
                <button class="view-research-btn" onclick="viewResearch('${researchData.title}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="track-progress-btn" onclick="trackProgress('${researchData.title}')">
                    <i class="fas fa-chart-line"></i> Track Progress
                </button>
            </div>
        `;
        projectsList.insertBefore(card, projectsList.firstChild);
    }

    // View research details
    window.viewResearch = function(researchId) {
        // Here you would typically fetch research details from your backend
        const researchDetails = {
            title: researchId,
            status: 'In Progress',
            timeline: [
                { stage: 'Research Initiation', status: 'completed' },
                { stage: 'Hypothesis Testing', status: 'current' },
                { stage: 'Data Analysis', status: 'pending' },
                { stage: 'Meta Review', status: 'pending' }
            ],
            content: {
                goals: 'Sample research goals...',
                context: 'Sample context...',
                scope: 'Sample scope...',
                methodology: 'Sample methodology...'
            },
            interactions: [
                {
                    agent: 'Research Agent',
                    time: '2h ago',
                    message: 'Initial analysis of research goals and hypotheses',
                    output: 'Sample analysis output...'
                }
            ]
        };

        // Update research details modal
        document.getElementById('researchDetailsTitle').textContent = researchDetails.title;
        document.getElementById('researchDetailsStatus').textContent = researchDetails.status;
        document.getElementById('researchDetailsStatus').className = 'status-badge in-progress';

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
                <p>${researchDetails.content.goals}</p>
            </div>
            <div class="content-section">
                <h4>Context</h4>
                <p>${researchDetails.content.context}</p>
            </div>
            <div class="content-section">
                <h4>Scope</h4>
                <p>${researchDetails.content.scope}</p>
            </div>
            <div class="content-section">
                <h4>Methodology</h4>
                <p>${researchDetails.content.methodology}</p>
            </div>
        `;

        // Update interactions
        const interactionsDiv = document.querySelector('.agent-interactions');
        interactionsDiv.innerHTML = researchDetails.interactions.map(interaction => `
            <div class="interaction-item">
                <div class="interaction-header">
                    <span class="agent-name">${interaction.agent}</span>
                    <span class="interaction-time">${interaction.time}</span>
                </div>
                <div class="interaction-content">
                    <p>${interaction.message}</p>
                    <div class="interaction-output">
                        <pre>${interaction.output}</pre>
                    </div>
                </div>
            </div>
        `).join('');

        // Show modal
        openModal(researchDetailsModal);
    };

    // Track research progress
    window.trackProgress = function(researchId) {
        // Here you would typically fetch progress data from your backend
        console.log('Tracking progress for:', researchId);
        // For now, just show the research details
        viewResearch(researchId);
    };

    // Notification system
    function showNotification(message) {
        const toast = document.getElementById('notificationToast');
        const messageSpan = toast.querySelector('.toast-message');
        messageSpan.textContent = message;
        toast.classList.add('show');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    toastCloseBtn.addEventListener('click', function() {
        notificationToast.classList.remove('show');
    });
}); 