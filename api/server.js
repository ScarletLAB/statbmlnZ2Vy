const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PLAYERS_FILE = path.join(__dirname, 'players.json');

// Убираем CORS ограничения
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

const server = http.createServer(async (req, res) => {
    // Для OPTIONS запросов сразу возвращаем CORS headers
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    // Обработка POST запроса (сохранение данных)
    if (req.method === 'POST') {
        try {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            }
            const data = JSON.parse(Buffer.concat(buffers).toString());
            
            // Читаем существующие данные
            let existingData = [];
            try {
                const fileContent = await fs.readFile(PLAYERS_FILE, 'utf8');
                existingData = JSON.parse(fileContent);
            } catch (err) {
                // Если файл не существует, создаем пустой массив
            }

            // Добавляем временную метку
            data.logged_at = new Date().toISOString();
            existingData.push(data);

            // Сохраняем обновленные данные
            await fs.writeFile(PLAYERS_FILE, JSON.stringify(existingData, null, 2));

            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify({ status: 'success', message: 'Data logged successfully.' }));
        } catch (error) {
            res.writeHead(500, corsHeaders);
            res.end(JSON.stringify({ status: 'error', message: error.message }));
        }
        return;
    }

    // Обработка GET запроса (получение данных)
    if (req.method === 'GET') {
        try {
            const data = await fs.readFile(PLAYERS_FILE, 'utf8');
            res.writeHead(200, corsHeaders);
            res.end(data);
        } catch (error) {
            res.writeHead(200, corsHeaders);
            res.end('[]');
        }
        return;
    }

    // Для всех остальных методов
    res.writeHead(405, corsHeaders);
    res.end(JSON.stringify({ status: 'error', message: 'Method not allowed.' }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
