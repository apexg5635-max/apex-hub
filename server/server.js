// ============================================
// APEX HUB - MAIN SERVER
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const videoRoutes = require('./routes/videos');
const liveRoutes = require('./routes/live');
const testSeriesRoutes = require('./routes/testSeries');

const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..')));

// ============ CREATE UPLOAD DIRECTORIES ============
const uploadDirs = ['uploads/videos', 'uploads/thumbnails', 'uploads/pdfs', 'uploads/temp'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log('✅ Created directory:', dir);
    }
});

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/test-series', testSeriesRoutes);

// ============ API HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// ============ SERVE FRONTEND ============
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 APEX HUB SERVER RUNNING');
    console.log('📡 Port:', PORT);
    console.log('🌐 API: http://localhost:' + PORT + '/api');
    console.log('📁 Uploads: http://localhost:' + PORT + '/uploads');
    console.log('═══════════════════════════════════════');
});