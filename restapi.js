const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Latest episodes
app.get('/animehaven/latest', async (req, res) => {
  try {
    const { data } = await axios.get('https://animehaven.xyz/');
    const $ = cheerio.load(data);
    const episodes = [];

    $('.animepost').each((i, el) => {
      const title = $(el).find('.tt').text().trim();
      const link = $(el).find('a').attr('href');
      if (title && link) {
        episodes.push({ title, link });
      }
    });

    res.json({ status: 'success', episodes, creator: 'Gabimaru' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, creator: 'Gabimaru' });
  }
});

// Search anime
app.get('/animehaven/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ status: 'error', message: 'Missing ?q= query', creator: 'Gabimaru' });

  try {
    const { data } = await axios.get(`https://animehaven.xyz/?s=${encodeURIComponent(q)}`);
    const $ = cheerio.load(data);
    const results = [];

    $('.animepost').each((i, el) => {
      const title = $(el).find('.tt').text().trim();
      const link = $(el).find('a').attr('href');
      if (title && link) {
        results.push({ title, link });
      }
    });

    res.json({ status: 'success', results, creator: 'Gabimaru' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, creator: 'Gabimaru' });
  }
});

// Homepage
app.get('/', (req, res) => {
  const base = req.headers.host.startsWith('localhost') ? `http://${req.headers.host}` : `https://${req.headers.host}`;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Gabimaru AnimeHaven API</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background: #1e1e1e;
          color: #fff;
          padding: 2rem;
        }
        h1 {
          color: #d32f2f;
          text-align: center;
        }
        .section {
          margin: 2rem auto;
          max-width: 800px;
          background: #2d2d2d;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .section h2 {
          color: #fff;
        }
        .endpoint {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #1e1e1e;
          border-left: 5px solid #d32f2f;
        }
        code, pre {
          background: #111;
          padding: 1rem;
          color: #0f0;
          border-radius: 5px;
          overflow-x: auto;
          display: block;
        }
        button {
          padding: 0.5rem 1rem;
          border: none;
          background: #d32f2f;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 0.5rem;
        }
        input {
          padding: 0.5rem;
          border: none;
          width: 100%;
          border-radius: 5px;
          margin-top: 0.5rem;
        }
      </style>
    </head>
    <body>
      <h1>Gabimaru AnimeHaven API</h1>

      <div class="section">
        <h2>/animehaven/latest</h2>
        <p>Returns a list of the latest anime episodes from AnimeHaven.</p>
        <p><strong>Query:</strong> None</p>
        <p><strong>Example response:</strong></p>
        <pre>{
  "status": "success",
  "episodes": [
    {
      "title": "One Piece Episode 1100",
      "link": "https://animehaven.xyz/one-piece-1100"
    }
  ],
  "creator": "Gabimaru"
}</pre>
        <button onclick="window.open('${base}/animehaven/latest', '_blank')">Test</button>
      </div>

      <div class="section">
        <h2>/animehaven/search</h2>
        <p>Search AnimeHaven for anime titles.</p>
        <p><strong>Query:</strong> ?q=naruto</p>
        <label for="query">Search query</label>
        <input type="text" id="query" placeholder="e.g., attack on titan" />
        <button onclick="search()">Test</button>
        <p><strong>Example response:</strong></p>
        <pre>{
  "status": "success",
  "results": [
    {
      "title": "Naruto Shippuden",
      "link": "https://animehaven.xyz/naruto-shippuden"
    }
  ],
  "creator": "Gabimaru"
}</pre>
      </div>

      <script>
        function search() {
          const query = document.getElementById('query').value.trim();
          if (!query) return alert('Enter a search term');
          window.open('${base}/animehaven/search?q=' + encodeURIComponent(query), '_blank');
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));