require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..')));

['uploads/videos', 'uploads/thumbnails', 'uploads/pdfs', 'data'].forEach(dir => {
    const p = path.join(__dirname, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const getDB = (name) => {
    const file = path.join(__dirname, 'data', name + '.json');
    if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};
const saveDB = (name, data) => {
    fs.writeFileSync(path.join(__dirname, 'data', name + '.json'), JSON.stringify(data, null, 2));
};

// ============ CREATE DEFAULT ADMIN ============
(function() {
    const users = getDB('users');
    if (!users.find(u => u.role === 'admin')) {
        const bcrypt = require('bcryptjs');
        bcrypt.hash('admin123', 10).then(hash => {
            users.push({
                id: 'admin-001', fullName: 'Admin User', mobile: '9999999999',
                email: 'admin@apexhub.in', password: hash, role: 'admin',
                createdAt: new Date().toISOString()
            });
            saveDB('users', users);
            console.log('✅ Default admin created: admin@apexhub.in / admin123');
        });
    }
})();

// ============ AUTH ============
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, mobile, email, password, role } = req.body;
        const users = getDB('users');
        if (users.find(u => u.mobile === mobile || u.email === email)) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash(password, 10);
        const user = { id: Date.now().toString(36), fullName, mobile, email, password: hash, role: role || 'student', createdAt: new Date().toISOString() };
        users.push(user);
        saveDB('users', users);
        const { password: _, ...u } = user;
        res.status(201).json({ success: true, user: u });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const users = getDB('users');
        const user = users.find(u => u.email === identifier || u.mobile === identifier);
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const bcrypt = require('bcryptjs');
        if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        const { password: _, ...u } = user;
        res.json({ success: true, token, user: u });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/send-otp', (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('📱 OTP:', otp);
    res.json({ success: true, otp });
});

// ============ COURSES ============
app.get('/api/courses', (req, res) => res.json({ success: true, courses: getDB('courses') }));
app.post('/api/courses', (req, res) => {
    const courses = getDB('courses');
    const course = { id: Date.now().toString(36), ...req.body, createdAt: new Date().toISOString() };
    courses.push(course); saveDB('courses', courses);
    res.status(201).json({ success: true, course });
});
app.put('/api/courses/:id', (req, res) => {
    const courses = getDB('courses');
    const i = courses.findIndex(c => c.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, message: 'Not found' });
    courses[i] = { ...courses[i], ...req.body, updatedAt: new Date().toISOString() };
    saveDB('courses', courses);
    res.json({ success: true, course: courses[i] });
});
app.delete('/api/courses/:id', (req, res) => {
    saveDB('courses', getDB('courses').filter(c => c.id !== req.params.id));
    res.json({ success: true, message: 'Deleted' });
});

// ============ VIDEOS ============
const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads', 'videos')),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
    }),
    limits: { fileSize: 500 * 1024 * 1024 }
});

app.post('/api/videos/upload', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file' });
    const videos = getDB('videos');
    const video = {
        id: Date.now().toString(36), title: req.body.title || 'Untitled',
        courseId: req.body.courseId || '', description: req.body.description || '',
        filename: req.file.filename, originalName: req.file.originalname,
        fileSize: req.file.size, videoUrl: '/uploads/videos/' + req.file.filename,
        duration: req.body.duration || '', lectureNumber: req.body.lectureNumber || '',
        status: 'ready', views: 0, createdAt: new Date().toISOString()
    };
    videos.push(video); saveDB('videos', videos);
    console.log('✅ Video uploaded:', video.title);
    res.status(201).json({ success: true, message: 'Uploaded!', video });
});

app.get('/api/videos', (req, res) => res.json({ success: true, videos: getDB('videos') }));

app.delete('/api/videos/:id', (req, res) => {
    const videos = getDB('videos');
    const video = videos.find(v => v.id === req.params.id);
    if (video) {
        const fp = path.join(__dirname, 'uploads', 'videos', video.filename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    saveDB('videos', videos.filter(v => v.id !== req.params.id));
    res.json({ success: true, message: 'Deleted' });
});

// ============ LIVE CLASSES ============
app.post('/api/live/schedule', (req, res) => {
    const live = getDB('liveClasses');
    const c = { id: Date.now().toString(36), ...req.body, status: 'scheduled', attendees: 0, createdAt: new Date().toISOString() };
    live.push(c); saveDB('liveClasses', live);
    res.status(201).json({ success: true, liveClass: c });
});
app.get('/api/live', (req, res) => res.json({ success: true, classes: getDB('liveClasses') }));

// ============ TEST SERIES ============
app.get('/api/test-series', (req, res) => res.json({ success: true, tests: getDB('testSeries') }));
app.post('/api/test-series', (req, res) => {
    const tests = getDB('testSeries');
    const t = { id: Date.now().toString(36), ...req.body, createdAt: new Date().toISOString() };
    tests.push(t); saveDB('testSeries', tests);
    res.status(201).json({ success: true, test: t });
});
app.post('/api/test-series/:id/questions', (req, res) => {
    const questions = getDB('questions');
    const qs = (req.body.questions || []).map(q => ({ id: Date.now().toString(36), testSeriesId: req.params.id, ...q }));
    questions.push(...qs); saveDB('questions', questions);
    res.status(201).json({ success: true, message: qs.length + ' questions added' });
});

// ============ HEALTH ============
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ============ START ============
app.listen(PORT, '0.0.0.0', () => console.log('🚀 Apex Hub running on port', PORT));