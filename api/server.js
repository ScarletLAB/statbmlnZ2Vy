const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PLAYERS_FILE = path.join(__dirname, 'players.json');
const STAT_HTML_FILE = path.join(__dirname, 'stat.html');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Обработка API запросов
    if (url.pathname === '/api/data') {
        if (req.method === 'POST') {
            try {
                const buffers = [];
                for await (const chunk of req) {
                    buffers.push(chunk);
                }
                const data = JSON.parse(Buffer.concat(buffers).toString());
                
                let existingData = [];
                try {
                    const fileContent = await fs.readFile(PLAYERS_FILE, 'utf8');
                    existingData = JSON.parse(fileContent);
                } catch (err) {
                    // Если файл не существует, используем пустой массив
                }

                data.logged_at = new Date().toISOString();
                existingData.push(data);

                await fs.writeFile(PLAYERS_FILE, JSON.stringify(existingData, null, 2));

                res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', message: 'Data logged successfully.' }));
            } catch (error) {
                res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: error.message }));
            }
            return;
        }

        if (req.method === 'GET') {
            try {
                const data = await fs.readFile(PLAYERS_FILE, 'utf8');
                res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
                res.end(data);
            } catch (error) {
                res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
                res.end('[]');
            }
            return;
        }
    }

    // Отдача HTML страницы
    if (url.pathname === '/' || url.pathname === '/stat.html') {
        try {
            const html = await fs.readFile(STAT_HTML_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
            return;
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
