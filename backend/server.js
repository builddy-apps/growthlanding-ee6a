import express from 'express';
import cors from 'cors';
import { addSubscriber, addContactSubmission, getTestimonials } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.post('/api/newsletter', (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }
        
        const result = addSubscriber(email.trim());
        
        if (result.success) {
            res.json({ success: true, message: 'Successfully subscribed to newsletter' });
        } else {
            res.status(409).json(result);
        }
    } catch (err) {
        console.error('Newsletter subscription error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.post('/api/contact', (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ success: false, error: 'Name must be at least 2 characters' });
        }
        
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }
        
        if (!message || typeof message !== 'string' || message.trim().length < 10) {
            return res.status(400).json({ success: false, error: 'Message must be at least 10 characters' });
        }
        
        const result = addContactSubmission(name.trim(), email.trim(), message.trim());
        res.json({ success: true, message: 'Contact form submitted successfully' });
    } catch (err) {
        console.error('Contact form submission error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/api/testimonials', (req, res) => {
    try {
        const { featured, limit } = req.query;
        
        const featuredOnly = featured !== 'false';
        const limitValue = limit ? parseInt(limit, 10) : null;
        
        if (limitValue && (isNaN(limitValue) || limitValue < 1)) {
            return res.status(400).json({ success: false, error: 'Limit must be a positive number' });
        }
        
        const testimonials = getTestimonials(featuredOnly, limitValue);
        res.json({ success: true, data: testimonials });
    } catch (err) {
        console.error('Testimonials fetch error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});