<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

$time = date('r');
echo "data: Szerver idő: {$time}\n\n";
flush();
?>