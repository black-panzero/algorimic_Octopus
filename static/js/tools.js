document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const searchInput = document.querySelector('.search-bar input');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    const createToolBtn = document.querySelector('.create-tool-btn');
    const createToolModal = document.getElementById('createToolModal');
    const closeModalBtn = document.querySelector('.close-modal');
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

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterTools(searchTerm, getActiveCategory());
    });

    // Category filter functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Filter tools based on search term and selected category
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
        createToolModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', function() {
        createToolModal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === createToolModal) {
            createToolModal.style.display = 'none';
        }
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
        createToolModal.style.display = 'none';
        createToolForm.reset();
        codeEditor.textContent = JSON.stringify(defaultConfig, null, 2);
    });
}); 