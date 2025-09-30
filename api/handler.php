<?php
// Main API handler for the Fix It application

// Include the database connection file.
// This makes the $conn variable available.
require_once 'db_connect.php';

// A helper function to send a standardized JSON response and exit.
function send_json_response($success, $message, $data = null) {
    global $conn;
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    $conn->close();
    exit;
}

// Get the requested action from the URL query string.
$action = $_GET['action'] ?? '';

// Get the body of the POST request, which is expected to be JSON.
$post_data = json_decode(file_get_contents("php://input"), true);

// Main logic router based on the 'action' parameter.
switch ($action) {
    case 'signup':
        // --- User Registration ---
        $name = $post_data['name'] ?? '';
        $email = $post_data['email'] ?? '';
        $password = $post_data['password'] ?? '';
        $phone = $post_data['phone'] ?? '';
        $type = $post_data['type'] ?? 'customer';

        if (empty($name) || empty($email) || empty($password) || empty($type)) {
            send_json_response(false, 'All required fields must be filled.');
        }

        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            send_json_response(false, 'An account with this email already exists.');
        }
        $stmt->close();

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $status = ($type === 'worker') ? 'pending' : 'active';
        
        $conn->begin_transaction();
        
        try {
            // Insert into users table
            $stmt = $conn->prepare("INSERT INTO users (name, email, password, phone, user_type, status) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssss", $name, $email, $hashed_password, $phone, $type, $status);
            $stmt->execute();
            $user_id = $stmt->insert_id;
            $stmt->close();

            if ($type === 'worker') {
                $shop_name = $post_data['shopName'] ?? '';
                $city = $post_data['city'] ?? '';
                $state = $post_data['state'] ?? '';
                $shop_address = $post_data['shopAddress'] ?? '';
                $professions = json_encode($post_data['professions'] ?? []);

                $stmt = $conn->prepare("INSERT INTO worker_profiles (user_id, shop_name, shop_address, city, state, professions) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("isssss", $user_id, $shop_name, $shop_address, $city, $state, $professions);
                $stmt->execute();
                $stmt->close();
            }

            $conn->commit();
            send_json_response(true, 'User registered successfully. Worker accounts require admin approval.');
        } catch (mysqli_sql_exception $exception) {
            $conn->rollback();
            send_json_response(false, 'Registration failed: ' . $exception->getMessage());
        }
        break;

    case 'login':
        // --- User Authentication ---
        $email = $post_data['email'] ?? '';
        $password = $post_data['password'] ?? '';

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password'])) {
                if ($user['user_type'] === 'worker' && $user['status'] === 'pending') {
                    send_json_response(false, 'Your account is pending admin approval.');
                }
                
                // Unset password before sending user data to frontend
                unset($user['password']);

                if ($user['user_type'] === 'worker') {
                    $stmt_profile = $conn->prepare("SELECT * FROM worker_profiles WHERE user_id = ?");
                    $stmt_profile->bind_param("i", $user['id']);
                    $stmt_profile->execute();
                    if($profile = $stmt_profile->get_result()->fetch_assoc()) {
                        $user = array_merge($user, $profile);
                    }
                    $stmt_profile->close();
                }
                
                send_json_response(true, 'Login successful.', ['user' => $user]);
            } else {
                send_json_response(false, 'Invalid email or password.');
            }
        } else {
            send_json_response(false, 'Invalid email or password.');
        }
        $stmt->close();
        break;

    case 'get_data':
        // --- Fetch Dashboard Data ---
        $type = $_GET['type'] ?? '';
        $user_id = $_GET['userId'] ?? 0;
        $data = [];

        if ($type === 'customer') {
            // Fetch requests, bids, and ratings for a customer
            $stmt = $conn->prepare("SELECT * FROM service_requests WHERE customer_id = ? ORDER BY created_at DESC");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $data['requests'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            $request_ids = array_map(fn($r) => $r['id'], $data['requests']);
            if (!empty($request_ids)) {
                $ids_placeholder = implode(',', array_fill(0, count($request_ids), '?'));
                $types = str_repeat('i', count($request_ids));

                $sql = "SELECT b.*, u.name as worker_name, wp.professions as worker_professions, u.phone as worker_phone, wp.rating as worker_rating FROM bids b JOIN users u ON b.worker_id = u.id JOIN worker_profiles wp ON b.worker_id = wp.user_id WHERE b.request_id IN ($ids_placeholder)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$request_ids);
                $stmt->execute();
                $data['bids'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

                $bid_ids = array_map(fn($b) => $b['id'], $data['bids']);
                if(!empty($bid_ids)) {
                    $bid_ids_placeholder = implode(',', array_fill(0, count($bid_ids), '?'));
                    $bid_types = str_repeat('i', count($bid_ids));
                    $stmt_ratings = $conn->prepare("SELECT * FROM ratings WHERE bid_id IN ($bid_ids_placeholder)");
                    $stmt_ratings->bind_param($bid_types, ...$bid_ids);
                    $stmt_ratings->execute();
                    $data['ratings'] = $stmt_ratings->get_result()->fetch_all(MYSQLI_ASSOC);
                } else {
                    $data['ratings'] = [];
                }
            } else {
                $data['bids'] = [];
                $data['ratings'] = [];
            }
        } elseif ($type === 'admin') {
            // Fetch all data for the admin dashboard
            $data['users'] = $conn->query("SELECT id, name, email, user_type, status FROM users")->fetch_all(MYSQLI_ASSOC);
            $data['requests'] = $conn->query("SELECT sr.*, u.name as customer_name FROM service_requests sr JOIN users u ON sr.customer_id = u.id")->fetch_all(MYSQLI_ASSOC);
            $data['bids'] = $conn->query("SELECT * FROM bids WHERE status='completed'")->fetch_all(MYSQLI_ASSOC);
            $data['pending_workers'] = $conn->query("SELECT u.*, wp.* FROM users u JOIN worker_profiles wp ON u.id = wp.user_id WHERE u.status = 'pending'")->fetch_all(MYSQLI_ASSOC);
        }
        
        send_json_response(true, 'Data fetched successfully.', $data);
        break;

    case 'create_request':
        // --- Customer Creates a New Service Request ---
        $customer_id = $post_data['customerId'];
        $service_type = $post_data['serviceType'];
        $urgency = $post_data['urgency'];
        $description = $post_data['description'];
        $address = $post_data['address'];
        $photo_data = $post_data['photo']; // Base64 encoded image
        $photo_path = null;

        if ($photo_data) {
            // Handle image upload
            list($type, $photo_data) = explode(';', $photo_data);
            list(, $photo_data)      = explode(',', $photo_data);
            $photo_data = base64_decode($photo_data);
            
            $filename = uniqid() . '.png';
            $photo_path = 'uploads/' . $filename;
            file_put_contents($photo_path, $photo_data);
        }

        $stmt = $conn->prepare("INSERT INTO service_requests (customer_id, service_type, urgency, description, address, photo) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $customer_id, $service_type, $urgency, $description, $address, $photo_path);
        
        if ($stmt->execute()) {
            send_json_response(true, 'Service request created successfully.');
        } else {
            send_json_response(false, 'Failed to create request.');
        }
        $stmt->close();
        break;

    case 'admin_approve_worker':
        $user_id = $post_data['userId'] ?? 0;
        $stmt = $conn->prepare("UPDATE users SET status = 'approved' WHERE id = ? AND user_type = 'worker'");
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            send_json_response(true, 'Worker approved successfully.');
        } else {
            send_json_response(false, 'Failed to approve worker.');
        }
        $stmt->close();
        break;

    case 'admin_delete_user':
        $user_id = $post_data['userId'] ?? 0;
        if ($user_id == 1) { // Prevent deleting main admin
            send_json_response(false, 'Cannot delete the main admin account.');
        }
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute()) {
            send_json_response(true, 'User deleted successfully.');
        } else {
            send_json_response(false, 'Failed to delete user.');
        }
        $stmt->close();
        break;
        
    // --- ADD MORE CASES FOR ALL OTHER ACTIONS HERE ---
    // (e.g., submit_bid, accept_bid, complete_task, etc.)

    default:
        send_json_response(false, 'Invalid action specified.');
        break;
}

?>
