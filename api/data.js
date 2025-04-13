const fs = require('fs').promises;
const path = require('path');

const PLAYERS_FILE = path.join(__dirname, '../data/players.json');

module.exports = async (req, res) => {
    // Настройка CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка OPTIONS запроса
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    // Создаем директорию data, если её нет
    try {
        await fs.mkdir(path.dirname(PLAYERS_FILE), { recursive: true });
    } catch (err) {
        // Игнорируем ошибку, если директория уже существует
    }

    if (req.method === 'POST') {
        try {
            let existingData = [];
            try {
                const fileContent = await fs.readFile(PLAYERS_FILE, 'utf8');
                existingData = JSON.parse(fileContent);
            } catch (err) {
                // Если файл не существует, используем пустой массив
            }

            const data = req.body;
            data.logged_at = new Date().toISOString();
            existingData.push(data);

            await fs.writeFile(PLAYERS_FILE, JSON.stringify(existingData, null, 2));
            res.status(200).json({ status: 'success', message: 'Data logged successfully' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
        return;
    }

    if (req.method === 'GET') {
        try {
            const data = await fs.readFile(PLAYERS_FILE, 'utf8');
            res.status(200).json(JSON.parse(data));
        } catch (error) {
            res.status(200).json([]); // Возвращаем пустой массив, если файл не существует
        }
        return;
    }

    res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
