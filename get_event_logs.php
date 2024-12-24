<?php
date_default_timezone_set('Europe/Kyiv');
header('Content-Type: application/json');

// Шляхи до файлів
$file1 = 'events_log_instantly.json';
$file2 = 'events_log_after.json';

// Функція для отримання даних з файлу JSON
function getEventLogs($file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $decodedContent = json_decode($content, true);
        
        // Перевірка на помилки JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['error' => 'Invalid JSON in file ' . $file]);
            exit;
        }
        
        return $decodedContent;
    }
    return [];
}

// Отримуємо логи з обох файлів
$events_log = getEventLogs($file1);
$events_log_2 = getEventLogs($file2);

// Об'єднуємо логи з двох файлів
$combinedLogs = [];
$maxIndex = max(count($events_log), count($events_log_2)); // Перевірка найбільшого індексу для циклу

for ($index = 0; $index < $maxIndex; $index++) {
    $combinedLogs[] = [
        'id' => isset($events_log[$index]['id']) ? $events_log[$index]['id'] : null,
        'action' => isset($events_log[$index]['message']) ? $events_log[$index]['message'] : 'N/A',
        'time_server' => isset($events_log[$index]['serverTime']) ? $events_log[$index]['serverTime'] : 'N/A',
        'time_local_storage' => isset($events_log_2[$index]['time']) ? $events_log_2[$index]['time'] : 'N/A',
    ];
}

// Перевіряємо на порожні логи
if (empty($combinedLogs)) {
    echo json_encode(['error' => 'Both log files are empty']);
    exit;
}

// Перевірка на успішне кодування JSON
$jsonData = json_encode($combinedLogs);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Error encoding JSON']);
    exit;
}

// Виводимо JSON з об'єднаними даними
echo $jsonData;
?>
