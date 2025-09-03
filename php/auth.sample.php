<?php
/**
 * Sample Authentication Configuration
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to auth.php
 * 2. Generate a secure bearer token
 * 3. Replace 'your-secret-bearer-token-here' with your generated token
 * 4. Keep the auth.php file secret and DO NOT commit it to version control
 */

// Bearer token for API authentication
// Generate a secure token using: bin2hex(random_bytes(32))
define('BEARER_TOKEN', 'your-secret-bearer-token-here-change-this-to-something-secure');

// Authentication settings
define('AUTH_ENABLED', true);
define('TOKEN_HEADER', 'Authorization');
define('TOKEN_PREFIX', 'Bearer ');

/**
 * To generate a new secure token, uncomment and run the line below:
 */
// echo "Generated Bearer Token: " . bin2hex(random_bytes(32)) . "\n";

/**
 * Example of a strong token (DO NOT USE THIS EXACT ONE):
 * 7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
 */

/**
 * Verify bearer token from request headers
 */
function verifyBearerToken() {
    if (!AUTH_ENABLED) {
        return true;
    }
    
    $headers = getallheaders();
    
    // Check for Authorization header
    $authHeader = null;
    foreach ($headers as $key => $value) {
        if (strtolower($key) === 'authorization') {
            $authHeader = $value;
            break;
        }
    }
    
    if (!$authHeader) {
        return false;
    }
    
    // Extract token from "Bearer TOKEN" format
    if (strpos($authHeader, TOKEN_PREFIX) !== 0) {
        return false;
    }
    
    $token = substr($authHeader, strlen(TOKEN_PREFIX));
    
    // Verify token
    return hash_equals(BEARER_TOKEN, trim($token));
}

/**
 * Send authentication error response
 */
function sendAuthError($message = 'Authentication required') {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => $message,
        'error' => 'AUTHENTICATION_REQUIRED'
    ]);
    exit;
}

/**
 * Middleware to check authentication
 */
function requireAuth() {
    if (!verifyBearerToken()) {
        sendAuthError('Invalid or missing bearer token');
    }
}
?>
