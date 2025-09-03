<?php
require_once 'config.php';

echo "<h2>Mistake Tracker Database Setup</h2>\n";

try {
    // Initialize database
    if (initializeDatabase()) {
        echo "<p style='color: green;'>✅ Database and tables created successfully!</p>\n";
        
        // Get connection to verify
        $pdo = getDBConnection();
        if ($pdo) {
            echo "<p style='color: green;'>✅ Database connection verified!</p>\n";
            
            // Check if table exists and show structure
            $stmt = $pdo->prepare("DESCRIBE mistakes");
            $stmt->execute();
            $columns = $stmt->fetchAll();
            
            echo "<h3>Table Structure:</h3>\n";
            echo "<table border='1' style='border-collapse: collapse;'>\n";
            echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>\n";
            
            foreach ($columns as $column) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($column['Field']) . "</td>";
                echo "<td>" . htmlspecialchars($column['Type']) . "</td>";
                echo "<td>" . htmlspecialchars($column['Null']) . "</td>";
                echo "<td>" . htmlspecialchars($column['Key']) . "</td>";
                echo "<td>" . htmlspecialchars($column['Default']) . "</td>";
                echo "<td>" . htmlspecialchars($column['Extra']) . "</td>";
                echo "</tr>\n";
            }
            echo "</table>\n";
            
            // Insert sample data
            echo "<h3>Adding Sample Data:</h3>\n";
            
            $sampleMistakes = [
                [
                    'mistake_date' => '2025-09-01',
                    'mistake_issue' => 'Forgot to validate user input in contact form',
                    'context_situation' => 'Working on a client website contact form feature during a tight deadline',
                    'mentor_feedback' => 'Always sanitize and validate inputs - security should never be an afterthought',
                    'what_learned' => 'Security validation needs to be built into the development process, not added later',
                    'plan_improve' => 'Create a pre-development checklist that includes security considerations',
                    'status' => 'In progress'
                ],
                [
                    'mistake_date' => '2025-08-28',
                    'mistake_issue' => 'Pushed code without running tests',
                    'context_situation' => 'Was rushing to deploy a hotfix before leaving for the day',
                    'mentor_feedback' => 'No matter how urgent, tests are non-negotiable. They save more time than they cost',
                    'what_learned' => 'Rushing leads to more problems. Better to deploy tested code late than broken code on time',
                    'plan_improve' => 'Set up automated pre-commit hooks that run tests',
                    'status' => 'Resolved'
                ],
                [
                    'mistake_date' => '2025-08-25',
                    'mistake_issue' => 'Hardcoded API credentials in source code',
                    'context_situation' => 'Working on integrating a third-party service for the first time',
                    'mentor_feedback' => 'Use environment variables for all sensitive data. Never commit secrets',
                    'what_learned' => 'Security practices need to be learned and followed from day one',
                    'plan_improve' => 'Study environment variable management and implement .env files',
                    'status' => 'Resolved'
                ]
            ];
            
            $stmt = $pdo->prepare("INSERT INTO mistakes (mistake_date, mistake_issue, context_situation, mentor_feedback, what_learned, plan_improve, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
            
            $inserted = 0;
            foreach ($sampleMistakes as $mistake) {
                try {
                    $stmt->execute(array_values($mistake));
                    $inserted++;
                } catch (PDOException $e) {
                    // Ignore duplicate entries if running setup multiple times
                    if ($e->getCode() != 23000) {
                        throw $e;
                    }
                }
            }
            
            echo "<p style='color: green;'>✅ {$inserted} sample mistakes added!</p>\n";
            
            // Show current count
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM mistakes");
            $stmt->execute();
            $count = $stmt->fetch()['count'];
            
            echo "<p><strong>Total mistakes in database: {$count}</strong></p>\n";
            
        } else {
            echo "<p style='color: red;'>❌ Could not connect to database!</p>\n";
        }
    } else {
        echo "<p style='color: red;'>❌ Failed to initialize database!</p>\n";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>\n";
}

echo "<hr>\n";
echo "<h3>Next Steps:</h3>\n";
echo "<ol>\n";
echo "<li>Make sure your web server (Apache/Nginx) is running</li>\n";
echo "<li>Make sure MySQL is running</li>\n";
echo "<li>Update the database credentials in <code>php/config.php</code> if needed</li>\n";
echo "<li>Open <code>index.html</code> in your web browser</li>\n";
echo "</ol>\n";

echo "<h3>Configuration:</h3>\n";
echo "<ul>\n";
echo "<li><strong>Database Host:</strong> " . DB_HOST . "</li>\n";
echo "<li><strong>Database Name:</strong> " . DB_NAME . "</li>\n";
echo "<li><strong>Database User:</strong> " . DB_USER . "</li>\n";
echo "</ul>\n";
?>
