<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// POST 데이터 받기
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email'])) {
    echo json_encode(['success' => false, 'message' => '잘못된 요청입니다.']);
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

// 해당 이메일의 사용자 찾기 및 업데이트
$found = false;
foreach ($users as $index => $user) {
    if ($user['email'] === $email) {
        // 업데이트할 필드들 (email은 변경 불가)
        $updateFields = [
            'name', 'nickname', 'password', 'character', 
            'level', 'exp', 'solvedQuizzes', 'visitedBuildings', 
            'badges', 'playerX', 'playerY'
        ];
        
        foreach ($updateFields as $field) {
            if (isset($input[$field])) {
                $users[$index][$field] = $input[$field];
            }
        }
        
        $found = true;
        break;
    }
}

if (!$found) {
    echo json_encode(['success' => false, 'message' => '사용자를 찾을 수 없습니다.']);
    exit;
}

// 파일에 저장
if (file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT))) {
    // 업데이트된 사용자 데이터 반환
    echo json_encode([
        'success' => true,
        'message' => '저장 완료!',
        'user' => $users[$index]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => '저장 실패!']);
}
?>
