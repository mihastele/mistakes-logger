// Global variables
let mistakes = [];
let allMistakes = []; // Store all mistakes for pagination
let editingId = null;
let bearerToken = null;
let isAuthenticated = false;
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let currentSearchTerm = '';
let currentStatusFilter = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Set today's date as default
    document.getElementById('mistake_date').value = new Date().toISOString().split('T')[0];

    // Load saved bearer token from localStorage
    loadSavedToken();

    // Load mistakes from database
    loadMistakes();

    // Setup form submission
    document.getElementById('mistakeForm').addEventListener('submit', handleFormSubmit);

    // Update auth status display
    updateAuthStatus();
});

// Load mistakes from database
async function loadMistakes() {
    try {
        const response = await fetch('php/api.php?action=get_mistakes', {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        if (data.success) {
            allMistakes = data.data?.mistakes || data.mistakes || [];
            mistakes = allMistakes;
            setupPagination();
            renderMistakes();
            updateStats();
        } else {
            console.error('Error loading mistakes:', data.message);
            if (data.error === 'AUTHENTICATION_REQUIRED') {
                showAuthModal();
            }
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
    
    if (allMistakes.length === 0) {
        emptyState.style.display = 'block';
        tableContainer.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    tableContainer.style.display = 'block';
    
    // Get current page data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMistakes = mistakes.slice(startIndex, endIndex);
    
    tbody.innerHTML = currentMistakes.map(mistake => `
        <tr>
            <td>${formatDate(mistake.mistake_date)}</td>
            <td class="text-cell" title="${escapeHtml(mistake.mistake_issue)}">${escapeHtml(mistake.mistake_issue)}</td>
            <td class="text-cell" title="${escapeHtml(mistake.context_situation)}">${escapeHtml(mistake.context_situation)}</td>
            <td class="text-cell" title="${escapeHtml(mistake.mentor_feedback || '')}">${escapeHtml(mistake.mentor_feedback || '')}</td>
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
    
    updatePaginationInfo();
}

// Setup pagination
function setupPagination() {
    totalPages = Math.ceil(mistakes.length / itemsPerPage);
    currentPage = Math.min(currentPage, Math.max(1, totalPages));
    renderPaginationControls();
}

// Render pagination controls
function renderPaginationControls() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    let paginationHTML = `
        <button class="btn btn-secondary btn-small" onclick="goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-double-left"></i>
        </button>
        <button class="btn btn-secondary btn-small" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-left"></i>
        </button>
    `;
    
    // Show page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button class="btn btn-secondary btn-small" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-right"></i>
        </button>
        <button class="btn btn-secondary btn-small" onclick="goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-double-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Change items per page
function changeItemsPerPage() {
    const select = document.getElementById('itemsPerPage');
    itemsPerPage = parseInt(select.value);
    currentPage = 1; // Reset to first page
    setupPagination();
    renderMistakes();
}

// Go to specific page
function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderMistakes();
        renderPaginationControls();
    }
}

// Update pagination info
function updatePaginationInfo() {
    const infoElement = document.getElementById('paginationInfo');
    if (!infoElement) return;
    
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, mistakes.length);
    
    infoElement.textContent = `Showing ${startItem}-${endItem} of ${mistakes.length} mistakes`;
}

// Update statistics
function updateStats() {
    const total = allMistakes.length;
    const resolved = allMistakes.filter(m => m.status === 'Resolved').length;
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
    const mistake = allMistakes.find(m => m.id === id);
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
            headers: getAuthHeaders(true), // true for FormData
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            loadMistakes(); // Reload the list
        } else {
            if (data.error === 'AUTHENTICATION_REQUIRED') {
                showAuthModal();
            } else {
                alert('Error deleting mistake: ' + data.message);
            }
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
            headers: getAuthHeaders(true), // true for FormData
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            closeModal();
            loadMistakes(); // Reload the list
        } else {
            if (data.error === 'AUTHENTICATION_REQUIRED') {
                showAuthModal();
            } else {
                alert('Error saving mistake: ' + data.message);
            }
        }
    } catch (error) {
        console.error('Error saving mistake:', error);
        alert('Error saving mistake. Please try again.');
    }
}

// Search mistakes
function searchMistakes() {
    currentSearchTerm = document.getElementById('searchInput').value.toLowerCase();
    applyFilters();
}

// Filter mistakes
function filterMistakes() {
    currentStatusFilter = document.getElementById('statusFilter').value;
    applyFilters();
}

// Apply both search and status filters
function applyFilters() {
    let filteredMistakes = allMistakes;
    
    // Apply search filter
    if (currentSearchTerm) {
        filteredMistakes = filteredMistakes.filter(mistake => 
            mistake.mistake_issue.toLowerCase().includes(currentSearchTerm) ||
            mistake.context_situation.toLowerCase().includes(currentSearchTerm) ||
            mistake.what_learned.toLowerCase().includes(currentSearchTerm) ||
            mistake.plan_improve.toLowerCase().includes(currentSearchTerm) ||
            (mistake.mentor_feedback && mistake.mentor_feedback.toLowerCase().includes(currentSearchTerm))
        );
    }
    
    // Apply status filter
    if (currentStatusFilter !== 'all') {
        filteredMistakes = filteredMistakes.filter(mistake => mistake.status === currentStatusFilter);
    }
    
    mistakes = filteredMistakes;
    
    // Reset to first page when filtering
    currentPage = 1;
    setupPagination();
    renderMistakes();
}// Show weekly review
function showWeeklyReview() {
    const reviewContent = document.getElementById('reviewContent');

    // Get mistakes from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentMistakes = allMistakes.filter(mistake => 
        new Date(mistake.mistake_date) >= oneWeekAgo
    );
    
    // Find patterns (group by similar issues)
    const patterns = findPatterns(allMistakes);
    
    // Find recently resolved mistakes
    const recentlyResolved = allMistakes.filter(mistake => 
        mistake.status === 'Resolved' && new Date(mistake.mistake_date) >= oneWeekAgo
    );    let reviewHtml = `
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

// Authentication Functions
function loadSavedToken() {
    const saved = localStorage.getItem('mistakeTracker_bearerToken');
    if (saved) {
        bearerToken = saved;
        isAuthenticated = true;
    }
}

function saveToken(token) {
    bearerToken = token;
    isAuthenticated = true;
    localStorage.setItem('mistakeTracker_bearerToken', token);
    updateAuthStatus();
}

function clearToken() {
    bearerToken = null;
    isAuthenticated = false;
    localStorage.removeItem('mistakeTracker_bearerToken');
    updateAuthStatus();
}

function getAuthHeaders(isFormData = false) {
    const headers = {};

    // Don't set Content-Type for FormData requests - let browser handle it
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    return headers;
}

function updateAuthStatus() {
    const indicator = document.getElementById('authIndicator');
    const button = document.getElementById('authButton');

    if (isAuthenticated) {
        indicator.textContent = '🔓 Authenticated';
        indicator.className = 'auth-indicator authenticated';
        button.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        button.onclick = logout;
    } else {
        indicator.textContent = '🔒 Not Authenticated';
        indicator.className = 'auth-indicator not-authenticated';
        button.innerHTML = '<i class="fas fa-key"></i> Enter API Key';
        button.onclick = showAuthModal;
    }
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    // Clear previous inputs
    document.getElementById('bearerTokenInput').value = '';
    document.getElementById('keyFileInput').value = '';
    hideAuthMessage();
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function logout() {
    if (confirm('Are you sure you want to logout? You\'ll need to re-enter your API key.')) {
        clearToken();
        // Clear mistakes data
        mistakes = [];
        renderMistakes();
        updateStats();
    }
}

function handleKeyFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result.trim();
        if (content) {
            document.getElementById('bearerTokenInput').value = content;
            document.getElementById('fileInfo').style.display = 'block';
            showAuthMessage('Key file loaded successfully. Click "Authenticate" to proceed.', 'info');
        } else {
            showAuthMessage('The selected file appears to be empty.', 'error');
        }
    };
    reader.readAsText(file);
}

function toggleTokenVisibility() {
    const input = document.getElementById('bearerTokenInput');
    const icon = document.getElementById('eyeIcon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

async function authenticateUser() {
    const token = document.getElementById('bearerTokenInput').value.trim();

    if (!token) {
        showAuthMessage('Please enter a bearer token or upload a key file.', 'error');
        return;
    }

    // Test the token
    try {
        const response = await fetch('php/api.php?action=test_auth', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            saveToken(token);
            showAuthMessage('Authentication successful!', 'success');
            document.getElementById('testAuthBtn').style.display = 'inline-block';

            // Auto-close modal after 2 seconds
            setTimeout(() => {
                closeAuthModal();
                loadMistakes(); // Reload data with authentication
            }, 2000);
        } else {
            showAuthMessage('Authentication failed: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showAuthMessage('Error during authentication. Please check your connection.', 'error');
    }
}

async function testAuthentication() {
    if (!bearerToken) {
        showAuthMessage('No token available for testing.', 'error');
        return;
    }

    try {
        const response = await fetch('php/api.php?action=test_auth', {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (data.success) {
            showAuthMessage('Connection test successful! Authentication is working.', 'success');
        } else {
            showAuthMessage('Connection test failed: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Test error:', error);
        showAuthMessage('Connection test failed. Please check your network.', 'error');
    }
}

function showAuthMessage(message, type) {
    const messageEl = document.getElementById('authStatusMessage');
    messageEl.textContent = message;
    messageEl.className = `auth-status-message ${type}`;
    messageEl.style.display = 'block';
}

function hideAuthMessage() {
    document.getElementById('authStatusMessage').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('testAuthBtn').style.display = 'none';
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
window.onclick = function (event) {
    const formModal = document.getElementById('formModal');
    const reviewModal = document.getElementById('reviewModal');
    const authModal = document.getElementById('authModal');

    if (event.target === formModal) {
        closeModal();
    }

    if (event.target === reviewModal) {
        closeReviewModal();
    }

    if (event.target === authModal) {
        closeAuthModal();
    }
}
