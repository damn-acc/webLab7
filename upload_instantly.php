<?php
date_default_timezone_set('Europe/Kyiv');
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (isset($data['id'], $data['message'])) {
        $serverTime = date('h:i:s A');

        $file = 'events_log_instantly.json';
        $currentData = [];

        if (file_exists($file)) {
            $fileContents = file_get_contents($file);
            $currentData = json_decode($fileContents, true);
        }

        $currentData[] = [
            'id' => $data['id'],
            'serverTime' => $serverTime,
            'message' => $data['message']
        ];

        if (file_put_contents($file, json_encode($currentData, JSON_PRETTY_PRINT))) {
            echo json_encode(['status' => 'success', 'message' => 'Event logged successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to write to log file']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid event data']);
    }
}
?>
