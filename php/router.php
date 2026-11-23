<?php

declare(strict_types=1);

// Router for the PHP built-in server: serve the page, its assets and the
// API paths, and nothing else (no .env, composer files, data/ or vendor/).
// API calls (/health, /payment-methods, /config, /mock-mode) go to index.php.
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');

// Serve index.html for the root (the built-in server would pick index.php)
if ($path === '/') {
    header('Content-Type: text/html');
    readfile(__DIR__ . '/index.html');
    return true;
}

// Route API calls to index.php (our API router)
$apiPaths = ['/health', '/payment-methods', '/config', '/mock-mode'];
if (in_array($path, $apiPaths, true)) {
    require_once __DIR__ . '/index.php';
    return true;
}

// Serve the page's static assets (the PHP files are only reached through the API paths)
$isAsset = preg_match('#^/(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_.-]+\.(?:html|css|js|png|jpe?g|gif|svg|ico|webp|woff2?)$#', $path);
$isHidden = preg_match('#(^|/)(\.|vendor/|node_modules/|data/)#', $path);

if ($isAsset && !$isHidden && is_file(__DIR__ . $path)) {
    return false;
}

// Handle 404 for unknown paths
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => 'Endpoint not found',
    'path' => ltrim($path, '/')
]);
return true;
