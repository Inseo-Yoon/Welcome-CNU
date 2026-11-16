<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// POST 데이터 받기
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email'])) {
    echo json_encode(['success' => false, 'message' => '이메일이 필요합니다.']);
    exit;
}

$email = strtolower(trim($input['email']));

// users.json 파일 경로
$usersFile = __DIR__ . '/users.json';

if (!file_exists($usersFile)) {
    echo json_encode(['success' => false, 'message' => '사용자 파일이 없습니다.']);
    exit;
}

// 사용자 목록 불러오기
$users = json_decode(file_get_contents($usersFile), true);
if (!is_array($users)) {
    echo json_encode(['success' => false, 'message' => '사용자 데이터가 손상되었습니다.']);
    exit;
}

// 해당 이메일의 사용자 찾기
$foundUser = null;
foreach ($users as $user) {
    if ($user['email'] === $email) {
        $foundUser = $user;
        break;
    }
}

if ($foundUser) {
    echo json_encode([
        'success' => true,
        'user' => $foundUser
    ]);
} else {
    echo json_encode(['success' => false, 'message' => '사용자를 찾을 수 없습니다.']);
}
?>
