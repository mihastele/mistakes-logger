<?php
require_once 'config.php';
require_once 'auth.php';

// Enable CORS for frontend requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Initialize database
if (!initializeDatabase()) {
    sendJSONResponse(false, 'Database initialization failed');
}

// Get database connection
$pdo = getDBConnection();
if (!$pdo) {
    sendJSONResponse(false, 'Database connection failed');
}

// Determine action
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Check authentication for protected endpoints
$protectedActions = ['add_mistake', 'update_mistake', 'delete_mistake'];
if (in_array($action, $protectedActions)) {
    requireAuth();
}

switch ($action) {
    case 'get_mistakes':
        getMistakes($pdo);
        break;
    
    case 'add_mistake':
        addMistake($pdo, $_POST);
        break;
    
    case 'update_mistake':
        updateMistake($pdo, $_POST);
        break;
    
    case 'delete_mistake':
        deleteMistake($pdo, $_POST);
        break;
    
    case 'get_stats':
        getStats($pdo);
        break;
    
    case 'test_auth':
        testAuth();
        break;
    
    default:
        sendJSONResponse(false, 'Invalid action');
}

// Get all mistakes
function getMistakes($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM mistakes ORDER BY mistake_date DESC, created_at DESC");
        $stmt->execute();
        $mistakes = $stmt->fetchAll();
        
        sendJSONResponse(true, 'Mistakes retrieved successfully', ['mistakes' => $mistakes]);
    } catch (PDOException $e) {
        error_log("Error getting mistakes: " . $e->getMessage());
        sendJSONResponse(false, 'Error retrieving mistakes');
    }
}

// Add new mistake
function addMistake($pdo, $data) {
    try {
        // Sanitize and validate data
        $sanitized = sanitizeInput($data);
        $errors = validateMistakeData($sanitized);
        
        if (!empty($errors)) {
            sendJSONResponse(false, implode(', ', $errors));
        }
        
        $sql = "INSERT INTO mistakes (mistake_date, mistake_issue, context_situation, mentor_feedback, what_learned, plan_improve, status) 
                VALUES (:mistake_date, :mistake_issue, :context_situation, :mentor_feedback, :what_learned, :plan_improve, :status)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($sanitized);
        
        $mistakeId = $pdo->lastInsertId();
        
        sendJSONResponse(true, 'Mistake added successfully', ['id' => $mistakeId]);
    } catch (PDOException $e) {
        error_log("Error adding mistake: " . $e->getMessage());
        sendJSONResponse(false, 'Error adding mistake');
    }
}

// Update existing mistake
function updateMistake($pdo, $data) {
    try {
        if (empty($data['id']) || !is_numeric($data['id'])) {
            sendJSONResponse(false, 'Invalid mistake ID');
        }
        
        // Sanitize and validate data
        $sanitized = sanitizeInput($data);
        $errors = validateMistakeData($sanitized);
        
        if (!empty($errors)) {
            sendJSONResponse(false, implode(', ', $errors));
        }
        
        // Check if mistake exists
        $checkStmt = $pdo->prepare("SELECT id FROM mistakes WHERE id = :id");
        $checkStmt->execute(['id' => $data['id']]);
        if (!$checkStmt->fetch()) {
            sendJSONResponse(false, 'Mistake not found');
        }
        
        $sql = "UPDATE mistakes SET 
                mistake_date = :mistake_date,
                mistake_issue = :mistake_issue,
                context_situation = :context_situation,
                mentor_feedback = :mentor_feedback,
                what_learned = :what_learned,
                plan_improve = :plan_improve,
                status = :status
                WHERE id = :id";
        
        $sanitized['id'] = $data['id'];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($sanitized);
        
        sendJSONResponse(true, 'Mistake updated successfully');
    } catch (PDOException $e) {
        error_log("Error updating mistake: " . $e->getMessage());
        sendJSONResponse(false, 'Error updating mistake');
    }
}

// Delete mistake
function deleteMistake($pdo, $data) {
    try {
        if (empty($data['id']) || !is_numeric($data['id'])) {
            sendJSONResponse(false, 'Invalid mistake ID');
        }
        
        // Check if mistake exists
        $checkStmt = $pdo->prepare("SELECT id FROM mistakes WHERE id = :id");
        $checkStmt->execute(['id' => $data['id']]);
        if (!$checkStmt->fetch()) {
            sendJSONResponse(false, 'Mistake not found');
        }
        
        $stmt = $pdo->prepare("DELETE FROM mistakes WHERE id = :id");
        $stmt->execute(['id' => $data['id']]);
        
        sendJSONResponse(true, 'Mistake deleted successfully');
    } catch (PDOException $e) {
        error_log("Error deleting mistake: " . $e->getMessage());
        sendJSONResponse(false, 'Error deleting mistake');
    }
}

// Get statistics
function getStats($pdo) {
    try {
        $stats = [];
        
        // Total mistakes
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM mistakes");
        $stmt->execute();
        $stats['total'] = $stmt->fetch()['total'];
        
        // Resolved mistakes
        $stmt = $pdo->prepare("SELECT COUNT(*) as resolved FROM mistakes WHERE status = 'Resolved'");
        $stmt->execute();
        $stats['resolved'] = $stmt->fetch()['resolved'];
        
        // Progress rate
        $stats['progress_rate'] = $stats['total'] > 0 ? round(($stats['resolved'] / $stats['total']) * 100) : 0;
        
        // Mistakes by status
        $stmt = $pdo->prepare("SELECT status, COUNT(*) as count FROM mistakes GROUP BY status");
        $stmt->execute();
        $stats['by_status'] = $stmt->fetchAll();
        
        // Recent mistakes (last 7 days)
        $stmt = $pdo->prepare("SELECT COUNT(*) as recent FROM mistakes WHERE mistake_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
        $stmt->execute();
        $stats['recent'] = $stmt->fetch()['recent'];
        
        sendJSONResponse(true, 'Statistics retrieved successfully', ['stats' => $stats]);
    } catch (PDOException $e) {
        error_log("Error getting statistics: " . $e->getMessage());
        sendJSONResponse(false, 'Error retrieving statistics');
    }
}

// Test authentication endpoint
function testAuth() {
    requireAuth();
    sendJSONResponse(true, 'Authentication successful', ['authenticated' => true]);
}
?>
