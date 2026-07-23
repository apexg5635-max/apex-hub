// ============================================
// LIVE CLASS MANAGEMENT ROUTES
// ============================================
const express = require('express');
const Database = require('../models/data');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();
const liveDB = new Database('liveClasses');
const coursesDB = new Database('courses');

// ============ SCHEDULE LIVE CLASS ============
router.post('/schedule', authenticateToken, isAdmin, (req, res) => {
    try {
        const { title, courseId, faculty, date, startTime, duration, platform, streamUrl, description } = req.body;

        const liveClass = liveDB.create({
            title,
            courseId: courseId || '',
            faculty: faculty || '',
            date,
            startTime,
            duration: duration || 90,
            platform: platform || 'zoom',
            streamUrl: streamUrl || '',
            description: description || '',
            status: 'scheduled',
            attendees: 0,
            chatMessages: [],
            recording: null
        });

        res.status(201).json({
            success: true,
            message: 'Live class scheduled successfully!',
            liveClass
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error scheduling live class.' });
    }
});

// ============ START LIVE CLASS ============
router.post('/:id/start', authenticateToken, isAdmin, (req, res) => {
    const liveClass = liveDB.findById(req.params.id);
    if (!liveClass) {
        return res.status(404).json({ success: false, message: 'Live class not found.' });
    }

    // Generate meeting link if not provided
    let streamUrl = liveClass.streamUrl;
    if (!streamUrl && liveClass.platform === 'zoom') {
        streamUrl = `https://zoom.us/j/${Date.now().toString(36)}`;
    }

    liveDB.update(req.params.id, {
        status: 'live',
        streamUrl,
        startedAt: new Date().toISOString()
    });

    res.json({
        success: true,
        message: 'Live class started!',
        streamUrl,
        joinUrl: `/student/live-class.html?id=${req.params.id}`
    });
});

// ============ END LIVE CLASS ============
router.post('/:id/end', authenticateToken, isAdmin, (req, res) => {
    liveDB.update(req.params.id, {
        status: 'ended',
        endedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Live class ended.' });
});

// ============ GET ALL LIVE CLASSES ============
router.get('/', authenticateToken, (req, res) => {
    const { status, courseId } = req.query;
    let classes = liveDB.findAll();

    if (status) classes = classes.filter(c => c.status === status);
    if (courseId) classes = classes.filter(c => c.courseId === courseId);

    res.json({ success: true, classes, total: classes.length });
});

// ============ GET UPCOMING LIVE CLASSES ============
router.get('/upcoming', authenticateToken, (req, res) => {
    const classes = liveDB.findMany({ status: 'scheduled' });
    res.json({ success: true, classes, total: classes.length });
});

// ============ JOIN LIVE CLASS ============
router.post('/:id/join', authenticateToken, (req, res) => {
    const liveClass = liveDB.findById(req.params.id);
    if (!liveClass || liveClass.status !== 'live') {
        return res.status(400).json({ success: false, message: 'Class is not currently live.' });
    }

    liveDB.update(req.params.id, { attendees: (liveClass.attendees || 0) + 1 });

    res.json({
        success: true,
        streamUrl: liveClass.streamUrl,
        title: liveClass.title,
        faculty: liveClass.faculty
    });
});

// ============ SEND CHAT MESSAGE ============
router.post('/:id/chat', authenticateToken, (req, res) => {
    const { message } = req.body;
    const liveClass = liveDB.findById(req.params.id);

    if (!liveClass) {
        return res.status(404).json({ success: false, message: 'Live class not found.' });
    }

    const chatMessage = {
        id: Date.now().toString(),
        userId: req.user.id,
        userName: req.user.fullName || 'Student',
        message,
        timestamp: new Date().toISOString()
    };

    if (!liveClass.chatMessages) liveClass.chatMessages = [];
    liveClass.chatMessages.push(chatMessage);
    liveDB.update(req.params.id, { chatMessages: liveClass.chatMessages });

    res.json({ success: true, chatMessage });
});

// ============ DELETE LIVE CLASS ============
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    liveDB.delete(req.params.id);
    res.json({ success: true, message: 'Live class deleted.' });
});

module.exports = router;