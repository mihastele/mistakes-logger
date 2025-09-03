<?php
require_once 'config.php';

// Simple API test
echo "<h2>Mistake Tracker API Test</h2>\n";

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        echo "<p style='color: red;'>❌ Database connection failed!</p>\n";
        exit;
    }
    
    echo "<p style='color: green;'>✅ Database connection successful!</p>\n";
    
    // Test getting mistakes
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM mistakes");
    $stmt->execute();
    $count = $stmt->fetch()['count'];
    
    echo "<p><strong>Mistakes in database: {$count}</strong></p>\n";
    
    if ($count > 0) {
        echo "<h3>Recent Mistakes:</h3>\n";
        $stmt = $pdo->prepare("SELECT * FROM mistakes ORDER BY created_at DESC LIMIT 3");
        $stmt->execute();
        $mistakes = $stmt->fetchAll();
        
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
        echo "<tr><th>Date</th><th>Issue</th><th>Status</th></tr>\n";
        
        foreach ($mistakes as $mistake) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($mistake['mistake_date']) . "</td>";
            echo "<td>" . htmlspecialchars(substr($mistake['mistake_issue'], 0, 50)) . "...</td>";
            echo "<td>" . htmlspecialchars($mistake['status']) . "</td>";
            echo "</tr>\n";
        }
        echo "</table>\n";
    }
    
    // Test API endpoints
    echo "<h3>API Endpoints Test:</h3>\n";
    
    $baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/api.php';
    
    echo "<ul>\n";
    echo "<li><a href='{$baseUrl}?action=get_mistakes' target='_blank'>Get Mistakes</a></li>\n";
    echo "<li><a href='{$baseUrl}?action=get_stats' target='_blank'>Get Statistics</a></li>\n";
    echo "</ul>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>\n";
}

echo "<hr>\n";
echo "<p><a href='../index.html'>← Back to Mistake Tracker</a></p>\n";
?>
