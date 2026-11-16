<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// POST 데이터 받기
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => '잘못된 요청입니다.']);
    exit;
}

$email = strtolower(trim($input['email'] ?? ''));
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => '이메일과 비밀번호를 입력해주세요.']);
    exit;
}

// users.json 파일 경로
$usersFile = __DIR__ . '/users.json';

if (!file_exists($usersFile)) {
    echo json_encode(['success' => false, 'message' => '등록된 계정이 없습니다.']);
    exit;
}

// 사용자 목록 불러오기
$users = json_decode(file_get_contents($usersFile), true);
if (!is_array($users) || empty($users)) {
    echo json_encode(['success' => false, 'message' => '등록된 계정이 없습니다.']);
    exit;
}

// 이메일과 비밀번호 확인
$foundUser = null;
foreach ($users as $user) {
    if ($user['email'] === $email && $user['password'] === $password) {
        $foundUser = $user;
        break;
    }
}

if ($foundUser) {
    echo json_encode([
        'success' => true,
        'message' => '로그인 성공!',
        'user' => $foundUser
    ]);
} else {
    echo json_encode(['success' => false, 'message' => '이메일 또는 비밀번호가 잘못되었습니다.']);
}
?>




