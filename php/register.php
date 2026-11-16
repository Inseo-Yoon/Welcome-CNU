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

$name = trim($input['name'] ?? '');
$nickname = trim($input['nickname'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$password = trim($input['password'] ?? '');
$character = $input['character'] ?? '1';
$level = $input['level'] ?? 1;
$exp = $input['exp'] ?? 0;

// 유효성 검사
if (empty($name) || empty($nickname) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => '모든 필드를 입력해주세요.']);
    exit;
}

// users.json 파일 경로
$usersFile = __DIR__ . '/users.json';

// 파일이 없으면 빈 배열로 초기화
if (!file_exists($usersFile)) {
    file_put_contents($usersFile, json_encode([]));
}

// 기존 사용자 목록 불러오기
$users = json_decode(file_get_contents($usersFile), true);
if (!is_array($users)) {
    $users = [];
}

// 중복 이메일 검사
foreach ($users as $user) {
    if ($user['email'] === $email) {
        echo json_encode(['success' => false, 'message' => '이미 존재하는 이메일입니다.']);
        exit;
    }
}

// 새 사용자 추가
$newUser = [
    'name' => $name,
    'nickname' => $nickname,
    'email' => $email,
    'password' => $password, // 실제 서비스에서는 password_hash() 사용 권장
    'character' => $character,
    'level' => $level,
    'exp' => $exp,
    'solvedQuizzes' => [],
    'visitedBuildings' => [],
    'badges' => [],
    'playerX' => 77.3,
    'playerY' => 82.5
];

$users[] = $newUser;

// 파일에 저장
if (file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true, 'message' => '회원가입 성공!']);
} else {
    echo json_encode(['success' => false, 'message' => '서버 오류가 발생했습니다.']);
}
?>
