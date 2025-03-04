// Store current agent ID
let currentAgentId = null;

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add click listeners to agent cards
    const agentCards = document.querySelectorAll('.agent-card');
    agentCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const agentId = this.getAttribute('data-agent-id');
            openAgentModal(agentId);
        });
    });
});

function openCreateAgentModal() {
    const modal = document.getElementById('createAgentModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

function openAgentModal(agentId) {
    currentAgentId = agentId;
    const modal = document.getElementById('agentDetailsModal');
    const configEditor = document.getElementById('configEditor');
    
    // Get the configuration data for the selected agent
    const config = agentConfigs[agentId];
    if (!config) return;

    // Set the modal title
    document.getElementById('agentModalTitle').textContent = config.name;
    
    // Set the description
    document.getElementById('agentDescription').textContent = config.description;
    
    // Set the capabilities
    const capabilitiesList = document.getElementById('agentCapabilities');
    capabilitiesList.innerHTML = config.capabilities
        .map(cap => `<li>${cap}</li>`)
        .join('');
    
    // Set the integration
    document.getElementById('agentIntegration').textContent = config.integration;
    
    // Set the initial configuration format (JSON)
    switchConfigFormat('json');
    
    // Show the modal with animation
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function switchTab(tabName) {
    document.querySelectorAll('.modal-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function switchConfigFormat(format) {
    const configEditor = document.getElementById('configEditor');
    const agentId = currentAgentId; // Make sure this is set when opening the modal
    
    // Get the configuration data for the current agent
    const config = agentConfigs[agentId];
    if (!config) return;

    // Format the configuration based on the selected format
    let formattedConfig;
    if (format === 'json') {
        formattedConfig = JSON.stringify(config, null, 2);
    } else {
        // Python format
        formattedConfig = `agent_config = {
    "name": "${config.name}",
    "description": "${config.description}",
    "capabilities": ${JSON.stringify(config.capabilities, null, 4)},
    "integration": "${config.integration}"
}`;
    }

    configEditor.textContent = formattedConfig;
}

function switchCreateConfigFormat(format) {
    const configEditor = document.getElementById('createConfigEditor');
    
    // Default configuration template
    const defaultConfig = {
        name: "New Agent",
        description: "Agent description",
        capabilities: ["Capability 1", "Capability 2"],
        integration: "Integration details"
    };

    // Format the configuration based on the selected format
    let formattedConfig;
    if (format === 'json') {
        formattedConfig = JSON.stringify(defaultConfig, null, 2);
    } else {
        // Python format
        formattedConfig = `agent_config = {
    "name": "${defaultConfig.name}",
    "description": "${defaultConfig.description}",
    "capabilities": ${JSON.stringify(defaultConfig.capabilities, null, 4)},
    "integration": "${defaultConfig.integration}"
}`;
    }

    configEditor.textContent = formattedConfig;
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}

// Prevent modal from opening when clicking sidebar
document.addEventListener('click', function(event) {
    const sidebarLink = event.target.closest('.sidebar .nav-item');
    if (sidebarLink && sidebarLink.getAttribute('href').includes('agents')) {
        // Only prevent default and reload if we're not already on the agents page
        if (window.location.pathname !== sidebarLink.getAttribute('href')) {
            event.preventDefault();
            window.location.href = sidebarLink.getAttribute('href');
        }
    }
}); 