// Get avatar URLs
const userAvatar = document.querySelector('.sidebar .user-avatar img')?.src || '/static/images/default-avatar.png';
const aiAvatar = '/static/images/copilot-icon.png';

// Generate a session ID
const sessionId = crypto.randomUUID();
document.getElementById('sessionId').textContent = sessionId;

// Message handling
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const metricsPanel = document.querySelector('.metrics-side-panel');
const metricsToggle = document.querySelector('.metrics-toggle');
const metricsContent = document.querySelector('.metrics-content');
const metrics = document.getElementById('metrics');

// Initialize metrics panel state
let isMetricsPanelExpanded = false;

// Toggle metrics panel
metricsToggle.addEventListener('click', () => {
    isMetricsPanelExpanded = !isMetricsPanelExpanded;
    metricsPanel.classList.toggle('expanded', isMetricsPanelExpanded);
});

// Function to create a new message element with avatar
function createMessageElement(content, type) {
    const template = document.getElementById('messageTemplate');
    const message = template.content.cloneNode(true).querySelector('.message');
    
    // Use the original type-based classification
    message.classList.add(`${type}-message`);
    message.querySelector('.message-avatar img').src = type === 'assistant' ? aiAvatar : userAvatar;
    message.querySelector('.message-content').textContent = content;
    
    return message;
}

function addMessage(content, type, metadata = {}) {
    // Create message element using template with original type
    const messageElement = createMessageElement(content, type);
    chatMessages.appendChild(messageElement);
    
    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'message-metadata';
        metadataDiv.textContent = `Source: ${metadata.source || 'Unknown'} | Type: ${metadata.type || 'Unknown'}`;
        messageElement.appendChild(metadataDiv);
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateMetrics(metrics) {
    const metricsContainer = document.getElementById('metrics');
    metricsContainer.innerHTML = '';
    
    for (const [key, value] of Object.entries(metrics)) {
        if (typeof value === 'object') continue;
        
        const metricDiv = document.createElement('div');
        metricDiv.className = 'metric-item';
        metricDiv.innerHTML = `
            <span class="metric-label">${key}:</span>
            <span class="metric-value">${value}</span>
        `;
        metricsContainer.appendChild(metricDiv);
        
        // Add animation class
        metricDiv.classList.add('metric-update');
        // Remove animation class after animation completes
        setTimeout(() => metricDiv.classList.remove('metric-update'), 500);
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Disable input while processing
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';
    
    try {
        const response = await fetch('/chat/process/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Add assistant response
            addMessage(data.response, 'assistant', data.metadata);
            
            // Update metrics
            if (data.metrics) {
                updateMetrics(data.metrics);
            }
        } else {
            addMessage(`Error: ${data.error}`, 'system');
        }
    } catch (error) {
        addMessage(`Error: ${error.message}`, 'system');
    } finally {
        // Re-enable input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Load chat history
async function loadChatHistory() {
    try {
        const response = await fetch(`/chat/history/${sessionId}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            data.history.forEach(msg => {
                addMessage(msg.content, msg.type, msg.metadata);
            });
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Load initial chat history
loadChatHistory();

// Periodically update metrics
setInterval(async () => {
    try {
        const response = await fetch(`/chat/metrics/${sessionId}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.metrics.length > 0) {
            updateMetrics(data.metrics[0].data);
        }
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}, 5000); 