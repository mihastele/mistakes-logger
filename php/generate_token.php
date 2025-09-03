<?php
/**
 * Bearer Token Generator
 * 
 * Run this script to generate a secure bearer token for your Mistake Tracker app.
 * Copy the generated token to your auth.php file.
 */

echo "<h2>Bearer Token Generator</h2>\n";
echo "<p>Generate a secure token for your Mistake Tracker authentication:</p>\n";

// Generate a secure random token
$token = bin2hex(random_bytes(32));

echo "<div style='background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;'>\n";
echo "<h3>Your Generated Bearer Token:</h3>\n";
echo "<code style='background: #fff; padding: 10px; display: block; word-break: break-all; border: 1px solid #ddd; border-radius: 4px;'>{$token}</code>\n";
echo "</div>\n";

echo "<div style='background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 20px 0;'>\n";
echo "<h3>Setup Instructions:</h3>\n";
echo "<ol>\n";
echo "<li>Copy the token above</li>\n";
echo "<li>Create a new file: <code>php/auth.php</code></li>\n";
echo "<li>Copy the contents from <code>php/auth.sample.php</code></li>\n";
echo "<li>Replace <code>'your-secret-bearer-token-here-change-this-to-something-secure'</code> with your generated token</li>\n";
echo "<li>Save the file and keep it secure (it's already in .gitignore)</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<div style='background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;'>\n";
echo "<h3>Client Setup:</h3>\n";
echo "<p>Your users can authenticate by:</p>\n";
echo "<ul>\n";
echo "<li><strong>Method 1:</strong> Creating a text file with the token and uploading it through the app</li>\n";
echo "<li><strong>Method 2:</strong> Entering the token directly in the authentication modal</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div style='background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;'>\n";
echo "<h3>⚠️ Security Warning:</h3>\n";
echo "<ul>\n";
echo "<li>Keep this token secret</li>\n";
echo "<li>Don't commit auth.php to version control</li>\n";
echo "<li>Share the token securely with authorized users</li>\n";
echo "<li>Consider regenerating tokens periodically</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<hr>\n";
echo "<p><a href='../index.html'>← Back to Mistake Tracker</a> | <a href='test.php'>Test API</a></p>\n";
?>
