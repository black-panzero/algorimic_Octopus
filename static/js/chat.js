// Generate a session ID
const sessionId = crypto.randomUUID();
document.getElementById('sessionId').textContent = sessionId;

// Message handling
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const metricsPanel = document.getElementById('metrics');

function addMessage(content, type, metadata = {}) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';
    messageBubble.textContent = content;
    messageDiv.appendChild(messageBubble);
    
    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'message-metadata';
        metadataDiv.textContent = `Source: ${metadata.source || 'Unknown'} | Type: ${metadata.type || 'Unknown'}`;
        messageDiv.appendChild(metadataDiv);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateMetrics(metrics) {
    metricsPanel.innerHTML = '';
    
    for (const [key, value] of Object.entries(metrics)) {
        if (typeof value === 'object') continue;
        
        const metricDiv = document.createElement('div');
        metricDiv.className = 'metric-item';
        metricDiv.innerHTML = `
            <span class="metric-label">${key}:</span>
            <span class="metric-value">${value}</span>
        `;
        metricsPanel.appendChild(metricDiv);
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