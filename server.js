// server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Izinkan request dari frontend
app.use(cors());

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }

    const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query)}`;

    try {
        // Menggunakan user-agent agar terlihat seperti browser biasa
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const videos = [];

        // Selektor CSS ini berdasarkan struktur halaman XNXX saat ini.
        // BISA RUSAK JIKA XNXX MENGUBAH TAMPILAN MEREKA.
        $('.mozaique .thumb-block').each((index, element) => {
            const titleElement = $(element).find('p.title a');
            const title = titleElement.text().trim();
            const url = 'https://www.xnxx.com' + titleElement.attr('href');
            
            // Mengambil durasi dari overlay gambar
            const duration = $(element).find('.thumb-under .metadata .duration').text().trim();

            // Mengambil thumbnail
            const thumbnail = $(element).find('.thumb img').attr('data-src') || $(element).find('.thumb img').attr('src');

            if (title && url) {
                videos.push({ title, url, duration, thumbnail });
            }
        });

        res.json(videos);

    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        res.status(500).json({ error: 'Failed to fetch data from XNXX.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
