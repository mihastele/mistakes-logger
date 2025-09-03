// Global variables
let mistakes = [];
let editingId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('mistake_date').value = new Date().toISOString().split('T')[0];
    
    // Load mistakes from database
    loadMistakes();
    
    // Setup form submission
    document.getElementById('mistakeForm').addEventListener('submit', handleFormSubmit);
});

// Load mistakes from database
async function loadMistakes() {
    try {
        const response = await fetch('php/api.php?action=get_mistakes');
        const data = await response.json();
        
        if (data.success) {
            mistakes = data.mistakes;
            renderMistakes();
            updateStats();
        } else {
            console.error('Error loading mistakes:', data.message);
        }
    } catch (error) {
        console.error('Error loading mistakes:', error);
    }
}

// Render mistakes in the table
function renderMistakes() {
    const tbody = document.getElementById('mistakesTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableContainer = document.querySelector('.table-container');
    
    if (mistakes.length === 0) {
        emptyState.style.display = 'block';
        tableContainer.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';
    
    tbody.innerHTML = mistakes.map(mistake => `
        <tr>
            <td>${formatDate(mistake.mistake_date)}</td>
            <td class="text-cell" title="${escapeHtml(mistake.mistake_issue)}">${escapeHtml(mistake.mistake_issue)}</td>
            <td class="text-cell" title="${escapeHtml(mistake.context_situation)}">${escapeHtml(mistake.context_situation)}</td>
            <td class="text-cell" title="${escapeHtml(mistake.mentor_feedback)}">${escapeHtml(mistake.mentor_feedback)}</td>
            <td class="text-cell" title="${escapeHtml(mistake.what_learned)}">${escapeHtml(mistake.what_learned)}</td>
            <td class="text-cell" title="${escapeHtml(mistake.plan_improve)}">${escapeHtml(mistake.plan_improve)}</td>
            <td><span class="status-badge ${getStatusClass(mistake.status)}">${mistake.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-small" onclick="editMistake(${mistake.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteMistake(${mistake.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = mistakes.length;
    const resolved = mistakes.filter(m => m.status === 'Resolved').length;
    const progressRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    document.getElementById('totalMistakes').textContent = total;
    document.getElementById('resolvedMistakes').textContent = resolved;
    document.getElementById('progressRate').textContent = progressRate + '%';
}

// Show add form modal
function showAddForm() {
    editingId = null;
    document.getElementById('formTitle').textContent = 'Log New Mistake';
    document.getElementById('mistakeForm').reset();
    document.getElementById('mistake_date').value = new Date().toISOString().split('T')[0];
    document.getElementById('formModal').style.display = 'block';
}

// Edit mistake
function editMistake(id) {
    const mistake = mistakes.find(m => m.id === id);
    if (!mistake) return;
    
    editingId = id;
    document.getElementById('formTitle').textContent = 'Edit Mistake';
    document.getElementById('mistakeId').value = id;
    document.getElementById('mistake_date').value = mistake.mistake_date;
    document.getElementById('mistake_issue').value = mistake.mistake_issue;
    document.getElementById('context_situation').value = mistake.context_situation;
    document.getElementById('mentor_feedback').value = mistake.mentor_feedback;
    document.getElementById('what_learned').value = mistake.what_learned;
    document.getElementById('plan_improve').value = mistake.plan_improve;
    document.getElementById('status').value = mistake.status;
    
    document.getElementById('formModal').style.display = 'block';
}

// Delete mistake
async function deleteMistake(id) {
    if (!confirm('Are you sure you want to delete this mistake? This action cannot be undone.')) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_mistake');
        formData.append('id', id);
        
        const response = await fetch('php/api.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadMistakes(); // Reload the list
        } else {
            alert('Error deleting mistake: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting mistake:', error);
        alert('Error deleting mistake. Please try again.');
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('action', editingId ? 'update_mistake' : 'add_mistake');
    
    if (editingId) {
        formData.append('id', editingId);
    }
    
    formData.append('mistake_date', document.getElementById('mistake_date').value);
    formData.append('mistake_issue', document.getElementById('mistake_issue').value);
    formData.append('context_situation', document.getElementById('context_situation').value);
    formData.append('mentor_feedback', document.getElementById('mentor_feedback').value);
    formData.append('what_learned', document.getElementById('what_learned').value);
    formData.append('plan_improve', document.getElementById('plan_improve').value);
    formData.append('status', document.getElementById('status').value);
    
    try {
        const response = await fetch('php/api.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            loadMistakes(); // Reload the list
        } else {
            alert('Error saving mistake: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving mistake:', error);
        alert('Error saving mistake. Please try again.');
    }
}

// Filter mistakes
function filterMistakes() {
    const statusFilter = document.getElementById('statusFilter').value;
    
    // Show all mistakes if "all" is selected
    if (statusFilter === 'all') {
        renderMistakes();
        return;
    }
    
    // Filter mistakes by status
    const filteredMistakes = mistakes.filter(mistake => mistake.status === statusFilter);
    
    // Temporarily update the mistakes array for rendering
    const originalMistakes = mistakes;
    mistakes = filteredMistakes;
    renderMistakes();
    mistakes = originalMistakes; // Restore original array
}

// Show weekly review
function showWeeklyReview() {
    const reviewContent = document.getElementById('reviewContent');
    
    // Get mistakes from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentMistakes = mistakes.filter(mistake => 
        new Date(mistake.mistake_date) >= oneWeekAgo
    );
    
    // Find patterns (group by similar issues)
    const patterns = findPatterns(mistakes);
    
    // Find recently resolved mistakes
    const recentlyResolved = mistakes.filter(mistake => 
        mistake.status === 'Resolved' && new Date(mistake.mistake_date) >= oneWeekAgo
    );
    
    let reviewHtml = `
        <div class="review-section">
            <h3><i class="fas fa-calendar-week"></i> This Week's Activity</h3>
            <p><strong>${recentMistakes.length}</strong> mistakes logged this week</p>
            <p><strong>${recentlyResolved.length}</strong> mistakes resolved this week</p>
        </div>
    `;
    
    if (patterns.length > 0) {
        reviewHtml += `
            <div class="review-section">
                <h3><i class="fas fa-search"></i> Patterns Detected</h3>
                ${patterns.map(pattern => `
                    <div class="pattern-item">
                        <strong>${pattern.category}</strong> (${pattern.count} occurrences)
                        <br><small>Consider focusing on this area for improvement</small>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (recentlyResolved.length > 0) {
        reviewHtml += `
            <div class="review-section">
                <h3><i class="fas fa-trophy"></i> Celebrations - You've Improved!</h3>
                ${recentlyResolved.map(mistake => `
                    <div class="celebration-item">
                        <strong>✅ ${mistake.mistake_issue}</strong>
                        <br><small>Resolved on ${formatDate(mistake.mistake_date)}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (recentMistakes.length === 0 && patterns.length === 0 && recentlyResolved.length === 0) {
        reviewHtml += `
            <div class="review-section">
                <h3><i class="fas fa-info-circle"></i> No Activity This Week</h3>
                <p>No mistakes logged or resolved this week. Keep up the great work!</p>
            </div>
        `;
    }
    
    reviewContent.innerHTML = reviewHtml;
    document.getElementById('reviewModal').style.display = 'block';
}

// Find patterns in mistakes
function findPatterns(mistakes) {
    const categories = {};
    
    mistakes.forEach(mistake => {
        const issue = mistake.mistake_issue.toLowerCase();
        
        // Simple pattern detection based on keywords
        let category = 'Other';
        
        if (issue.includes('input') || issue.includes('validation') || issue.includes('sanitiz')) {
            category = 'Input Validation';
        } else if (issue.includes('test') || issue.includes('testing')) {
            category = 'Testing';
        } else if (issue.includes('security') || issue.includes('auth')) {
            category = 'Security';
        } else if (issue.includes('performance') || issue.includes('slow')) {
            category = 'Performance';
        } else if (issue.includes('ui') || issue.includes('interface') || issue.includes('user')) {
            category = 'User Interface';
        } else if (issue.includes('database') || issue.includes('query') || issue.includes('sql')) {
            category = 'Database';
        } else if (issue.includes('code') || issue.includes('logic') || issue.includes('algorithm')) {
            category = 'Code Logic';
        }
        
        categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories)
        .filter(([category, count]) => count > 1)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
}

// Close modal
function closeModal() {
    document.getElementById('formModal').style.display = 'none';
    editingId = null;
}

// Close review modal
function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusClass(status) {
    switch (status) {
        case 'Resolved':
            return 'status-resolved';
        case 'In progress':
            return 'status-progress';
        case 'Ongoing':
            return 'status-ongoing';
        default:
            return 'status-progress';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const formModal = document.getElementById('formModal');
    const reviewModal = document.getElementById('reviewModal');
    
    if (event.target === formModal) {
        closeModal();
    }
    
    if (event.target === reviewModal) {
        closeReviewModal();
    }
}
