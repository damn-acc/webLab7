<?php
date_default_timezone_set('Europe/Kyiv');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data && isset($data['events'])) {
        $file = 'events_log_after.json';

        $currentData = json_decode(file_get_contents($file), true) ?: [];

        $currentData = array_merge($currentData, $data['events']);

        file_put_contents($file, json_encode($currentData, JSON_PRETTY_PRINT));

        echo json_encode(['status' => 'success', 'message' => 'Events successfully saved']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    }
}
?>
