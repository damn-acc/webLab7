<?php
header('Content-Type: application/json');

$files = ['events_log_instantly.json', 'events_log_after.json'];

$response = [];
foreach ($files as $file) {
    if (file_exists($file)) {
        $result = file_put_contents($file, json_encode([]));
        if ($result === false) {
            $response[] = ['file' => $file, 'status' => 'error', 'message' => 'Failed to clear file'];
        } else {
            $response[] = ['file' => $file, 'status' => 'success', 'message' => 'File cleared successfully'];
        }
    } else {
        $response[] = ['file' => $file, 'status' => 'error', 'message' => 'File does not exist'];
    }
}

echo json_encode($response);
