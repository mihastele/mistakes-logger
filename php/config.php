<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'mistake_tracker');

// Create database connection
function getDBConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return false;
    }
}

// Create database and table if they don't exist
function initializeDatabase() {
    try {
        // First, create database if it doesn't exist
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        
        // Now connect to the database
        $pdo = getDBConnection();
        if (!$pdo) {
            return false;
        }
        
        // Create mistakes table
        $sql = "CREATE TABLE IF NOT EXISTS mistakes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            mistake_date DATE NOT NULL,
            mistake_issue TEXT NOT NULL,
            context_situation TEXT NOT NULL,
            mentor_feedback TEXT,
            what_learned TEXT NOT NULL,
            plan_improve TEXT NOT NULL,
            status ENUM('In progress', 'Resolved', 'Ongoing') NOT NULL DEFAULT 'In progress',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($sql);
        
        return true;
    } catch (PDOException $e) {
        error_log("Database initialization failed: " . $e->getMessage());
        return false;
    }
}

// Helper function to send JSON response
function sendJSONResponse($success, $message = '', $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Validate input data
function validateMistakeData($data) {
    $errors = [];
    
    if (empty($data['mistake_date'])) {
        $errors[] = 'Date is required';
    } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['mistake_date'])) {
        $errors[] = 'Invalid date format';
    }
    
    if (empty(trim($data['mistake_issue']))) {
        $errors[] = 'Mistake/Issue is required';
    }
    
    if (empty(trim($data['context_situation']))) {
        $errors[] = 'Context/Situation is required';
    }
    
    if (empty(trim($data['what_learned']))) {
        $errors[] = 'What I Learned is required';
    }
    
    if (empty(trim($data['plan_improve']))) {
        $errors[] = 'Plan to Improve is required';
    }
    
    if (!in_array($data['status'], ['In progress', 'Resolved', 'Ongoing'])) {
        $errors[] = 'Invalid status';
    }
    
    return $errors;
}

// Sanitize input data
function sanitizeInput($data) {
    return [
        'mistake_date' => trim($data['mistake_date']),
        'mistake_issue' => trim($data['mistake_issue']),
        'context_situation' => trim($data['context_situation']),
        'mentor_feedback' => trim($data['mentor_feedback'] ?? ''),
        'what_learned' => trim($data['what_learned']),
        'plan_improve' => trim($data['plan_improve']),
        'status' => trim($data['status'])
    ];
}
?>
