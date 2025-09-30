<?php
// Set headers for API access and error reporting
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// --- DATABASE CREDENTIALS ---
$host = 'sql12.freesqldatabase.com';
$dbname = 'sql12800063';
$user = 'sql12800063';
$pass = 'qQuqQzkiUw'; // ⚠️ IMPORTANT: Use your new password!
$port = 3306;

// Create a new database connection object
$conn = new mysqli($host, $user, $pass, $dbname, $port);

// Check for connection errors
if ($conn->connect_error) {
    // Stop execution and return an error message in JSON format
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

?>
