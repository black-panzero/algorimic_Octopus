// Store current tool ID
let currentToolId = null;

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchInput = document.querySelector('.search-bar input');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    const createToolBtn = document.querySelector('.create-tool-btn');
    const createToolModal = document.getElementById('createToolModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const formatSelect = document.getElementById('configFormat');
    const codeEditor = document.querySelector('.code-editor');

    // Default configuration template
    const defaultConfig = {
        "name": "New Tool",
        "description": "Tool description",
        "category": "llm",
        "capabilities": [],
        "parameters": {}
    };

    // Initialize code editor with default config
    codeEditor.textContent = JSON.stringify(defaultConfig, null, 2);

    // Add click listeners to tool cards
    toolCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const toolId = this.getAttribute('data-tool-id');
            console.log('Tool card clicked:', toolId); // Debug log
            if (toolId && window.toolConfigs && window.toolConfigs[toolId]) {
                openToolModal(toolId);
            } else {
                console.error('Invalid tool ID or missing configuration:', toolId);
            }
        });
    });

    // Close modal functionality
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            closeModal(modalId);
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterTools(searchTerm, getActiveCategory());
    });

    // Category filter functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterTools(searchInput.value.toLowerCase(), this.dataset.category);
        });
    });

    // Get currently active category
    function getActiveCategory() {
        const activeButton = document.querySelector('.category-btn.active');
        return activeButton ? activeButton.dataset.category : 'all';
    }

    // Filter tools based on search term and category
    function filterTools(searchTerm, category) {
        const toolCards = document.querySelectorAll('.tool-card');
        toolCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardTitle = card.querySelector('h3').textContent.toLowerCase();
            const cardDescription = card.querySelector('p').textContent.toLowerCase();
            const cardTags = Array.from(card.querySelectorAll('.capability-tag'))
                .map(tag => tag.textContent.toLowerCase());

            const matchesSearch = searchTerm === '' || 
                cardTitle.includes(searchTerm) || 
                cardDescription.includes(searchTerm) ||
                cardTags.some(tag => tag.includes(searchTerm));

            const matchesCategory = category === 'all' || cardCategory === category;

            card.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
        });
    }

    // Modal functionality
    createToolBtn.addEventListener('click', function() {
        openCreateToolModal();
    });

    // Configuration format switching
    formatSelect.addEventListener('change', function() {
        const format = this.value;
        const currentConfig = codeEditor.textContent;
        
        try {
            if (format === 'json') {
                // If current format is Python, convert to JSON
                if (currentConfig.includes('def')) {
                    const jsonConfig = convertPythonToJson(currentConfig);
                    codeEditor.textContent = JSON.stringify(jsonConfig, null, 2);
                }
            } else {
                // If current format is JSON, convert to Python
                if (currentConfig.includes('{')) {
                    const pythonConfig = convertJsonToPython(currentConfig);
                    codeEditor.textContent = pythonConfig;
                }
            }
        } catch (error) {
            console.error('Error converting configuration:', error);
            // Keep the current content if conversion fails
        }
    });

    // Convert Python configuration to JSON
    function convertPythonToJson(pythonConfig) {
        // Basic conversion logic - can be expanded based on needs
        const config = {};
        const lines = pythonConfig.split('\n');
        
        lines.forEach(line => {
            if (line.includes('=')) {
                const [key, value] = line.split('=').map(s => s.trim());
                config[key] = value.replace(/['"]/g, '');
            }
        });

        return config;
    }

    // Convert JSON configuration to Python
    function convertJsonToPython(jsonConfig) {
        const config = JSON.parse(jsonConfig);
        let pythonConfig = 'def get_config():\n';
        pythonConfig += '    return {\n';
        
        Object.entries(config).forEach(([key, value]) => {
            if (typeof value === 'object') {
                pythonConfig += `        '${key}': ${JSON.stringify(value, null, 2)},\n`;
            } else {
                pythonConfig += `        '${key}': '${value}',\n`;
            }
        });
        
        pythonConfig += '    }\n';
        return pythonConfig;
    }

    // Form submission
    const createToolForm = document.querySelector('.create-tool-form');
    createToolForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const description = document.getElementById('toolDescription').value;
        const category = document.getElementById('toolCategory').value;
        const config = codeEditor.textContent;

        // Here you would typically send this data to your backend
        console.log('Creating new tool:', {
            description,
            category,
            config
        });

        // Close modal and reset form
        closeModal('createToolModal');
        createToolForm.reset();
        codeEditor.textContent = JSON.stringify(defaultConfig, null, 2);
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Prevent modal from opening when clicking sidebar
    document.addEventListener('click', function(event) {
        const sidebarLink = event.target.closest('.sidebar .nav-item');
        if (sidebarLink && sidebarLink.getAttribute('href').includes('tools')) {
            if (window.location.pathname !== sidebarLink.getAttribute('href')) {
                event.preventDefault();
                window.location.href = sidebarLink.getAttribute('href');
            }
        }
    });
});

// Helper function to convert tool name to ID
function convertToId(name) {
    return name.toLowerCase().replace(/\s+/g, '-');
}

function openCreateToolModal() {
    const modal = document.getElementById('createToolModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Set default configuration
    switchCreateToolConfigFormat('json');
}

function openToolModal(toolId) {
    console.log('Opening modal for tool:', toolId); // Debug log
    
    currentToolId = toolId;
    const modal = document.getElementById('toolDetailsModal');
    const config = window.toolConfigs[toolId];
    
    console.log('Tool config:', config); // Debug log
    console.log('Modal element:', modal); // Debug log
    
    if (!config) {
        console.error('Tool configuration not found:', toolId);
        return;
    }

    if (!modal) {
        console.error('Tool details modal element not found');
        return;
    }

    // Set the modal title
    const titleElement = document.getElementById('toolModalTitle');
    if (titleElement) {
        titleElement.textContent = config.name;
    } else {
        console.error('Modal title element not found');
    }
    
    // Set the description
    const descriptionElement = document.getElementById('toolDescription');
    if (descriptionElement) {
        descriptionElement.textContent = config.description;
    } else {
        console.error('Description element not found');
    }
    
    // Set the capabilities
    const capabilitiesList = document.getElementById('toolCapabilities');
    if (capabilitiesList) {
        capabilitiesList.innerHTML = config.capabilities
            .map(cap => `<li>${cap}</li>`)
            .join('');
    } else {
        console.error('Capabilities list element not found');
    }
    
    // Set the integration
    const integrationElement = document.getElementById('toolIntegration');
    if (integrationElement) {
        integrationElement.textContent = config.integration;
    } else {
        console.error('Integration element not found');
    }
    
    // Set the parameters
    const parametersList = document.getElementById('toolParameters');
    if (parametersList) {
        parametersList.innerHTML = config.parameters
            .map(param => `
                <div class="parameter-item">
                    <h4 class="parameter-name">${param.name}</h4>
                    <div class="parameter-type">${param.type}</div>
                    <p class="parameter-description">${param.description}</p>
                </div>
            `)
            .join('');
    } else {
        console.error('Parameters list element not found');
    }
    
    // Set the initial configuration format (JSON)
    switchToolConfigFormat('json');
    
    // Show the modal
    modal.style.display = 'block';
    console.log('Modal display style set to block'); // Debug log
    
    setTimeout(() => {
        modal.classList.add('show');
        console.log('Modal show class added'); // Debug log
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function switchToolTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.modal-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    event.currentTarget.classList.add('active');
    document.getElementById(`tool${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
}

function switchToolConfigFormat(format) {
    // Update format buttons
    document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.format-btn[onclick*="${format}"]`).classList.add('active');
    
    const configEditor = document.getElementById('toolConfigEditor');
    const toolId = currentToolId;
    const config = window.toolConfigs[toolId];
    
    if (!config) return;

    // Format the configuration based on the selected format
    let formattedConfig;
    if (format === 'json') {
        formattedConfig = JSON.stringify(config, null, 2);
    } else {
        // Python format
        formattedConfig = `tool_config = {
    "name": "${config.name}",
    "description": "${config.description}",
    "capabilities": ${JSON.stringify(config.capabilities, null, 4)},
    "parameters": ${JSON.stringify(config.parameters, null, 4)},
    "integration": "${config.integration}"
}`;
    }

    configEditor.textContent = formattedConfig;
}

function switchCreateToolConfigFormat(format) {
    const configEditor = document.getElementById('createToolConfigEditor');
    
    // Default configuration template
    const defaultConfig = {
        name: "New Tool",
        description: "Tool description",
        capabilities: ["Capability 1", "Capability 2"],
        parameters: [
            {
                name: "parameter1",
                type: "string",
                description: "Description of parameter 1"
            }
        ],
        integration: "Integration details"
    };

    // Format the configuration based on the selected format
    let formattedConfig;
    if (format === 'json') {
        formattedConfig = JSON.stringify(defaultConfig, null, 2);
    } else {
        // Python format
        formattedConfig = `tool_config = {
    "name": "${defaultConfig.name}",
    "description": "${defaultConfig.description}",
    "capabilities": ${JSON.stringify(defaultConfig.capabilities, null, 4)},
    "parameters": ${JSON.stringify(defaultConfig.parameters, null, 4)},
    "integration": "${defaultConfig.integration}"
}`;
    }

    configEditor.textContent = formattedConfig;
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize the create tool form
document.addEventListener('DOMContentLoaded', function() {
    const createToolForm = document.querySelector('.create-tool-form');
    const codeEditor = document.getElementById('toolConfig');
    const configFormat = document.getElementById('configFormat');

    // Update configuration format when changed
    configFormat.addEventListener('change', function() {
        const format = this.value;
        if (format === 'json') {
            codeEditor.textContent = JSON.stringify({
                name: document.getElementById('toolName').value || "New Tool",
                description: document.getElementById('toolDescription').value || "Tool description",
                category: document.getElementById('toolCategory').value || "llm",
                capabilities: [],
                parameters: {}
            }, null, 2);
        } else {
            codeEditor.textContent = `def tool_config():
    return {
        "name": "${document.getElementById('toolName').value || 'New Tool'}",
        "description": "${document.getElementById('toolDescription').value || 'Tool description'}",
        "category": "${document.getElementById('toolCategory').value || 'llm'}",
        "capabilities": [],
        "parameters": {}
    }`;
        }
    });

    // Handle form submission
    createToolForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const toolData = {
            name: document.getElementById('toolName').value,
            description: document.getElementById('toolDescription').value,
            category: document.getElementById('toolCategory').value,
            config: codeEditor.textContent,
            format: configFormat.value
        };

        // Here you would typically send the data to your backend
        console.log('Tool data:', toolData);
        
        // Close the modal
        closeModal('createToolModal');
        
        // Reset form
        this.reset();
        codeEditor.textContent = JSON.stringify({
            name: "New Tool",
            description: "Tool description",
            category: "llm",
            capabilities: [],
            parameters: {}
        }, null, 2);
    });
}); 