require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..')));

// Create required directories
['uploads/videos', 'uploads/thumbnails', 'uploads/pdfs', 'data'].forEach(dir => {
    const p = path.join(__dirname, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// ============ SIMPLE DATABASE ============
const getDB = (name) => {
    const file = path.join(__dirname, 'data', name + '.json');
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveDB = (name, data) => {
    fs.writeFileSync(path.join(__dirname, 'data', name + '.json'), JSON.stringify(data, null, 2));
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, mobile, email, password } = req.body;
        const users = getDB('users');
        if (users.find(u => u.mobile === mobile)) {
            return res.status(400).json({ success: false, message: 'Mobile already registered' });
        }
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            fullName, mobile, email: email || '', password: hashedPassword,
            role: 'student', createdAt: new Date().toISOString()
        };
        users.push(user);
        saveDB('users', users);
        const { password: _, ...userData } = user;
        res.status(201).json({ success: true, message: 'Registered!', user: userData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const users = getDB('users');
        const user = users.find(u => u.mobile === identifier || u.email === identifier);
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const bcrypt = require('bcryptjs');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        const { password: _, ...userData } = user;
        res.json({ success: true, message: 'Login successful!', token, user: userData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/auth/send-otp', (req, res) => {
    const { mobile } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('OTP for', mobile, ':', otp);
    res.json({ success: true, message: 'OTP sent!', otp });
});

// ============ COURSE ROUTES ============
app.get('/api/courses', (req, res) => {
    res.json({ success: true, courses: getDB('courses') });
});

app.post('/api/courses', (req, res) => {
    const courses = getDB('courses');
    const course = { id: Date.now().toString(36), ...req.body, createdAt: new Date().toISOString() };
    courses.push(course);
    saveDB('courses', courses);
    res.status(201).json({ success: true, course });
});

app.put('/api/courses/:id', (req, res) => {
    const courses = getDB('courses');
    const idx = courses.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    courses[idx] = { ...courses[idx], ...req.body, updatedAt: new Date().toISOString() };
    saveDB('courses', courses);
    res.json({ success: true, course: courses[idx] });
});

app.delete('/api/courses/:id', (req, res) => {
    let courses = getDB('courses');
    courses = courses.filter(c => c.id !== req.params.id);
    saveDB('courses', courses);
    res.json({ success: true, message: 'Deleted' });
});

// ============ VIDEO UPLOAD ROUTES ============
const multer = require('multer');
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads', 'videos')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: videoStorage, limits: { fileSize: 500 * 1024 * 1024 } });

app.post('/api/videos/upload', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
    const videos = getDB('videos');
    const video = {
        id: Date.now().toString(36),
        title: req.body.title || 'Untitled',
        courseId: req.body.courseId || '',
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        videoUrl: '/uploads/videos/' + req.file.filename,
        status: 'ready',
        views: 0,
        createdAt: new Date().toISOString()
    };
    videos.push(video);
    saveDB('videos', videos);
    res.status(201).json({ success: true, message: 'Video uploaded!', video });
});

app.get('/api/videos', (req, res) => {
    res.json({ success: true, videos: getDB('videos') });
});

app.get('/api/videos/stream/:filename', (req, res) => {
    const videoPath = path.join(__dirname, 'uploads', 'videos', req.params.filename);
    if (!fs.existsSync(videoPath)) return res.status(404).json({ success: false, message: 'Not found' });
    const stat = fs.statSync(videoPath);
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Content-Type': 'video/mp4',
            'Content-Length': (end - start) + 1
        });
        fs.createReadStream(videoPath, { start, end }).pipe(res);
    } else {
        res.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Length': stat.size });
        fs.createReadStream(videoPath).pipe(res);
    }
});

// ============ LIVE CLASS ROUTES ============
app.post('/api/live/schedule', (req, res) => {
    const liveClasses = getDB('liveClasses');
    const live = { id: Date.now().toString(36), ...req.body, status: 'scheduled', attendees: 0, createdAt: new Date().toISOString() };
    liveClasses.push(live);
    saveDB('liveClasses', liveClasses);
    res.status(201).json({ success: true, liveClass: live });
});

app.get('/api/live', (req, res) => {
    res.json({ success: true, classes: getDB('liveClasses') });
});

app.post('/api/live/:id/start', (req, res) => {
    const liveClasses = getDB('liveClasses');
    const idx = liveClasses.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    liveClasses[idx].status = 'live';
    liveClasses[idx].startedAt = new Date().toISOString();
    saveDB('liveClasses', liveClasses);
    res.json({ success: true, liveClass: liveClasses[idx] });
});

// ============ TEST SERIES ROUTES ============
app.get('/api/test-series', (req, res) => {
    res.json({ success: true, tests: getDB('testSeries') });
});

app.post('/api/test-series', (req, res) => {
    const tests = getDB('testSeries');
    const test = { id: Date.now().toString(36), ...req.body, createdAt: new Date().toISOString() };
    tests.push(test);
    saveDB('testSeries', tests);
    res.status(201).json({ success: true, test });
});

app.post('/api/test-series/:id/questions', (req, res) => {
    const questions = getDB('questions');
    const newQuestions = (req.body.questions || []).map(q => ({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        testSeriesId: req.params.id,
        ...q
    }));
    questions.push(...newQuestions);
    saveDB('questions', questions);
    res.status(201).json({ success: true, message: `${newQuestions.length} questions added!` });
});

app.post('/api/test-series/:id/submit', (req, res) => {
    const { answers } = req.body;
    const questions = getDB('questions').filter(q => q.testSeriesId === req.params.id);
    let score = 0, total = 0;
    questions.forEach(q => {
        total += (q.marks || 1);
        if (answers[q.id] === q.correctAnswer) score += (q.marks || 1);
    });
    res.json({ success: true, result: { score, total, percentage: Math.round((score / total) * 100) } });
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Apex Hub Server Running on port', PORT);
});