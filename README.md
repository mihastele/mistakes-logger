# Mistake Tracker App

A comprehensive web application for tracking, analyzing, and learning from mistakes. Transform your slip-ups into growth opportunities!

## Features

### 🎯 Core Features
- **Log Mistakes**: Record detailed information about mistakes including context, feedback, and lessons learned
- **Track Progress**: Monitor your improvement with status tracking (In Progress, Resolved, Ongoing)
- **Weekly Reviews**: Automated pattern detection and progress celebration
- **Statistics Dashboard**: Visual overview of your learning journey
- **Filter & Search**: Find specific mistakes or filter by status

### 📊 Analytics
- Total mistakes logged
- Resolution rate tracking
- Pattern detection for recurring issues
- Progress celebration for resolved mistakes

### 🔐 Security Features
- **Bearer Token Authentication**: Secure API access with configurable tokens
- **File-based Key Management**: Upload key files or enter tokens manually
- **CORS Protection**: Properly configured cross-origin resource sharing
- **Input Validation**: Comprehensive server-side validation and sanitization

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Styling**: Custom CSS with Font Awesome icons

## Installation & Setup

### Prerequisites
- Web server (Apache, Nginx, or built-in PHP server)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Modern web browser

### Step 1: Server Setup

#### Option A: Using XAMPP/WAMP/MAMP
1. Install XAMPP, WAMP, or MAMP
2. Start Apache and MySQL services
3. Copy the project folder to `htdocs` (XAMPP) or `www` (WAMP)

#### Option B: Using Built-in PHP Server
```bash
# Navigate to project directory
cd /path/to/mistakesnotes

# Start PHP development server
php -S localhost:8000
```

### Step 2: Database Configuration

1. **Update database credentials** in `php/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'mistake_tracker');
```

2. **Run the setup script**:
   - Open your browser and navigate to: `http://localhost/mistakesnotes/php/setup.php`
   - Or if using built-in server: `http://localhost:8000/php/setup.php`
   - This will create the database, tables, and add sample data

3. **Verify installation**:
   - Visit: `http://localhost/mistakesnotes/php/test.php`
   - Check that all tests pass

### Step 3: Authentication Setup

1. **Generate a bearer token**:
   - Visit: `http://localhost/mistakesnotes/php/generate_token.php`
   - Copy the generated token

2. **Create authentication file**:
   - Copy `php/auth.sample.php` to `php/auth.php`
   - Replace the placeholder token with your generated token
   - Save the file (it's automatically excluded from git)

3. **Client authentication** (for users):
   - Option A: Create a text file with the bearer token and upload it through the app
   - Option B: Enter the bearer token directly in the authentication modal

### Step 4: Access the Application

Open your browser and navigate to:
- XAMPP/WAMP: `http://localhost/mistakesnotes/`
- Built-in server: `http://localhost:8000/`

## Usage Guide

### Adding a New Mistake

1. Click "Log New Mistake" button
2. Fill in the form:
   - **Date**: When the mistake occurred
   - **Mistake/Issue**: Brief description of what went wrong
   - **Context/Situation**: What you were working on, circumstances
   - **Mentor Feedback**: Any advice received (optional)
   - **What I Learned**: Your key takeaway
   - **Plan to Improve**: Concrete steps to prevent recurrence
   - **Status**: Current progress (In Progress, Resolved, Ongoing)

### Weekly Review

1. Click "Weekly Review" button
2. View automatically generated insights:
   - Recent activity summary
   - Pattern detection for recurring issues
   - Celebration of resolved mistakes

### Managing Mistakes

- **Edit**: Click the edit (pencil) icon to modify existing entries
- **Delete**: Click the delete (trash) icon to remove entries
- **Filter**: Use the status dropdown to filter by progress status

## Database Schema

```sql
CREATE TABLE mistakes (
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
);
```

## API Endpoints

### GET Requests
- `GET /php/api.php?action=get_mistakes` - Retrieve all mistakes
- `GET /php/api.php?action=get_stats` - Get statistics

### POST Requests
- `POST /php/api.php` with `action=add_mistake` - Add new mistake
- `POST /php/api.php` with `action=update_mistake` - Update existing mistake
- `POST /php/api.php` with `action=delete_mistake` - Delete mistake

## File Structure

```
mistakesnotes/
├── index.html              # Main application page
├── css/
│   └── style.css           # Application styles
├── js/
│   └── app.js             # Frontend JavaScript
├── php/
│   ├── config.php         # Database configuration
│   ├── api.php            # Main API endpoints
│   ├── setup.php          # Database setup script
│   └── test.php           # API test page
└── README.md              # This file
```

## Customization

### Changing the Theme
Edit `css/style.css` to modify colors, fonts, and layout:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #28a745;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
}
```

### Adding New Fields
1. Update the database schema in `php/config.php`
2. Add form fields in `index.html`
3. Update validation in `php/config.php`
4. Modify the API endpoints in `php/api.php`
5. Update the frontend JavaScript in `js/app.js`

### Pattern Detection
Customize pattern detection logic in `js/app.js` in the `findPatterns()` function.

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check MySQL service is running
- Verify credentials in `php/config.php`
- Ensure database exists

**404 Errors on API Calls**
- Check web server configuration
- Verify PHP is working: create a test file with `<?php phpinfo(); ?>`
- Check file permissions

**JavaScript Errors**
- Open browser developer tools (F12)
- Check console for error messages
- Verify all files are loaded correctly

**Styling Issues**
- Check if `css/style.css` is accessible
- Verify Font Awesome CDN is loading
- Test with browser cache disabled

## Security Considerations

- Input validation and sanitization implemented
- Prepared statements used for database queries
- XSS protection through proper escaping
- Consider implementing user authentication for production use

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is open source and available under the MIT License.
# mistakes-logger
