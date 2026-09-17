/**
 * THE LORD’S TABLE — BIBLE GAMES
 * Zero-Dependency Real-Time Event Server (Node.js Built-In HTTP + SSE)
 * 
 * Run with: node server.js
 * No `npm install` needed!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// In-Memory Game Store
const games = new Map(); // gameCode -> gameData
const clients = new Map(); // gameCode -> Set of response objects (SSE)

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

function broadcastGameUpdate(gameCode) {
    const game = games.get(gameCode);
    const roomClients = clients.get(gameCode);
    if (!roomClients || !game) return;

    const payload = `data: ${JSON.stringify(game)}\n\n`;
    for (const res of roomClients) {
        try {
            res.write(payload);
        } catch (e) {
            roomClients.delete(res);
        }
    }
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS for all local requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // --- API: Server Info ---
    if (pathname === '/api/info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            ip: getLocalIp(),
            port: PORT,
            activeGames: Array.from(games.keys())
        }));
        return;
    }

    // --- API: SSE Real-Time Stream ---
    // GET /api/stream/:code
    if (pathname.startsWith('/api/stream/')) {
        const gameCode = pathname.replace('/api/stream/', '').trim().toUpperCase();
        if (!gameCode) {
            res.writeHead(400);
            res.end('Missing game code');
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive'
        });
        res.write('\n');

        if (!clients.has(gameCode)) {
            clients.set(gameCode, new Set());
        }
        const roomClients = clients.get(gameCode);
        roomClients.add(res);

        // Send current state if game exists
        if (games.has(gameCode)) {
            res.write(`data: ${JSON.stringify(games.get(gameCode))}\n\n`);
        }

        req.on('close', () => {
            roomClients.delete(res);
            if (roomClients.size === 0) {
                clients.delete(gameCode);
            }
        });
        return;
    }

    // --- API: Get Game State ---
    // GET /api/game/:code
    if (req.method === 'GET' && pathname.startsWith('/api/game/')) {
        const gameCode = pathname.replace('/api/game/', '').trim().toUpperCase();
        const game = games.get(gameCode);
        if (!game) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Game not found' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(game));
        return;
    }

    // --- API: Save / Update Game State ---
    // POST /api/game/:code
    if (req.method === 'POST' && pathname.startsWith('/api/game/')) {
        const gameCode = pathname.replace('/api/game/', '').trim().toUpperCase();
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const incomingData = JSON.parse(body);
                const existing = games.get(gameCode) || {};
                const updated = { ...existing, ...incomingData, code: gameCode, updatedAt: Date.now() };
                games.set(gameCode, updated);
                broadcastGameUpdate(gameCode);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, game: updated }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON', details: err.message }));
            }
        });
        return;
    }

    // --- Static File Serving ---
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    
    // Security check: ensure path is within PUBLIC_DIR
    const safePath = path.resolve(filePath);
    if (!safePath.startsWith(path.resolve(PUBLIC_DIR))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(safePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Fallback to index.html for SPA routes
            fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (errHtml, data) => {
                if (errHtml) {
                    res.writeHead(404);
                    res.end('Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(data);
                }
            });
            return;
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        fs.readFile(safePath, (errRead, content) => {
            if (errRead) {
                res.writeHead(500);
                res.end('Error reading file');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIp();
    console.log('\n=============================================================');
    console.log('       THE LORD’S TABLE — BIBLE GAMES (LIVE EVENT SERVER)     ');
    console.log('=============================================================');
    console.log(`  👑 Host / Laptop URL:      http://localhost:${PORT}`);
    console.log(`  📱 Player / Venue WiFi:    http://${localIp}:${PORT}`);
    console.log('=============================================================');
    console.log('  Guests on the same WiFi can join directly using their phones!');
    console.log('  Press Ctrl+C to stop the server.\n');
});
