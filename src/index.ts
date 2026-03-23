import express, { Request, Response } from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- Types ---
interface ShortURL {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  lastClickedAt: string | null;
  clickHistory: { timestamp: string; userAgent: string }[];
}

// --- In-memory store ---
const db = new Map<string, ShortURL>();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// --- Helpers ---
function generateCode(length = 6): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// --- API Routes ---

// POST /shorten — create short URL
app.post('/api/shorten', (req: Request, res: Response) => {
  const { url, customCode } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ success: false, error: 'Invalid or missing URL' });
  }

  const shortCode = customCode || generateCode();

  if (db.has(shortCode)) {
    return res.status(409).json({ success: false, error: 'Short code already taken' });
  }

  const entry: ShortURL = {
    id: crypto.randomUUID(),
    originalUrl: url,
    shortCode,
    shortUrl: `${BASE_URL}/${shortCode}`,
    clicks: 0,
    createdAt: new Date().toISOString(),
    lastClickedAt: null,
    clickHistory: [],
  };

  db.set(shortCode, entry);
  res.status(201).json({ success: true, data: entry });
});

// GET /:code — redirect to original URL
app.get('/:code', (req: Request, res: Response) => {
  const entry = db.get(req.params.code);

  if (!entry) {
    return res.status(404).json({ success: false, error: 'Short URL not found' });
  }

  const now = new Date().toISOString();
  entry.clicks++;
  entry.lastClickedAt = now;
  entry.clickHistory.push({
    timestamp: now,
    userAgent: req.headers['user-agent'] || 'unknown',
  });

  res.redirect(302, entry.originalUrl);
});

// GET /api/stats/:code — get stats for a short URL
app.get('/api/stats/:code', (req: Request, res: Response) => {
  const entry = db.get(req.params.code);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Short URL not found' });
  }
  res.json({ success: true, data: entry });
});

// GET /api/urls — list all short URLs
app.get('/api/urls', (_req: Request, res: Response) => {
  const urls = Array.from(db.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ success: true, count: urls.length, data: urls });
});

// DELETE /api/urls/:code — delete a short URL
app.delete('/api/urls/:code', (req: Request, res: Response) => {
  if (!db.has(req.params.code)) {
    return res.status(404).json({ success: false, error: 'Short URL not found' });
  }
  db.delete(req.params.code);
  res.json({ success: true, message: 'Short URL deleted' });
});

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    uptime: process.uptime().toFixed(2) + 's',
    totalUrls: db.size,
    totalClicks: Array.from(db.values()).reduce((sum, e) => sum + e.clicks, 0),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`URL Shortener running → http://localhost:${PORT}`));

export default app;
