import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'app.db'));
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT,
        company TEXT,
        quote TEXT NOT NULL,
        avatar_url TEXT,
        rating INTEGER DEFAULT 5,
        featured INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    );
`);

export const addSubscriber = (email) => {
    try {
        const stmt = db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)');
        const info = stmt.run(email);
        return { success: true, id: info.lastInsertRowid };
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return { success: false, error: 'Email already subscribed' };
        }
        throw err;
    }
};

export const addContactSubmission = (name, email, message) => {
    const stmt = db.prepare('INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)');
    const info = stmt.run(name, email, message);
    return { success: true, id: info.lastInsertRowid };
};

export const getTestimonials = (featuredOnly = true, limit = null) => {
    let sql = 'SELECT * FROM testimonials';
    const params = [];
    
    if (featuredOnly) {
        sql += ' WHERE featured = 1';
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (limit) {
        sql += ' LIMIT ?';
        params.push(limit);
    }
    
    const stmt = db.prepare(sql);
    return stmt.all(...params);
};

export const addTestimonial = (data) => {
    const stmt = db.prepare(`
        INSERT INTO testimonials (name, role, company, quote, avatar_url, rating, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
        data.name,
        data.role || null,
        data.company || null,
        data.quote,
        data.avatar_url || null,
        data.rating || 5,
        data.featured ? 1 : 0
    );
    return { success: true, id: info.lastInsertRowid };
};

export default db;