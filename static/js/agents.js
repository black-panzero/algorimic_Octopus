function openCreateAgentModal() {
    document.getElementById('createAgentModal').style.display = 'block';
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
    
    // Show the modal
    modal.style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
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
        event.target.style.display = 'none';
    }
} 