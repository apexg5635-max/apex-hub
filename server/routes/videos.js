// ============================================
// VIDEO UPLOAD & MANAGEMENT ROUTES
// ============================================
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('../models/data');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();
const videosDB = new Database('videos');
const coursesDB = new Database('courses');

// ============ MULTER CONFIGURATION ============
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'videos');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const thumbnailStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'thumbnails');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = 'thumb-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const uploadVideo = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid video format. Only MP4, WebM, MOV, AVI allowed.'));
        }
    }
});

const uploadThumbnail = multer({
    storage: thumbnailStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed for thumbnail.'));
        }
    }
});

// ============ UPLOAD VIDEO ============
router.post('/upload', authenticateToken, isAdmin, uploadVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No video file provided.' });
        }

        const { title, courseId, description, lectureNumber, duration } = req.body;

        const videoData = {
            title: title || 'Untitled Video',
            courseId: courseId || '',
            description: description || '',
            lectureNumber: parseInt(lectureNumber) || 0,
            duration: duration || '0',
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            videoUrl: '/uploads/videos/' + req.file.filename,
            thumbnailUrl: '',
            status: 'processing',
            views: 0,
            uploadedBy: req.user.id
        };

        const video = videosDB.create(videoData);

        // If courseId provided, add video to course
        if (courseId) {
            const course = coursesDB.findById(courseId);
            if (course) {
                if (!course.videos) course.videos = [];
                course.videos.push(video.id);
                coursesDB.update(courseId, { videos: course.videos });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully! Processing will begin shortly.',
            video: video
        });

    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({ success: false, message: 'Error uploading video: ' + error.message });
    }
});

// ============ UPLOAD THUMBNAIL ============
router.post('/thumbnail/:videoId', authenticateToken, isAdmin, uploadThumbnail.single('thumbnail'), (req, res) => {
    try {
        const { videoId } = req.params;
        const video = videosDB.findById(videoId);

        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found.' });
        }

        const thumbnailUrl = '/uploads/thumbnails/' + req.file.filename;
        videosDB.update(videoId, { thumbnailUrl });

        res.json({ success: true, message: 'Thumbnail uploaded!', thumbnailUrl });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error uploading thumbnail.' });
    }
});

// ============ GET ALL VIDEOS ============
router.get('/', authenticateToken, (req, res) => {
    const { courseId, status } = req.query;
    let videos = videosDB.findAll();

    if (courseId) {
        videos = videos.filter(v => v.courseId === courseId);
    }
    if (status) {
        videos = videos.filter(v => v.status === status);
    }

    res.json({ success: true, videos, total: videos.length });
});

// ============ GET SINGLE VIDEO ============
router.get('/:id', authenticateToken, (req, res) => {
    const video = videosDB.findById(req.params.id);
    if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    // Increment view count
    videosDB.update(req.params.id, { views: (video.views || 0) + 1 });

    res.json({ success: true, video });
});

// ============ UPDATE VIDEO DETAILS ============
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
    const { title, description, courseId, status, lectureNumber, duration } = req.body;
    const video = videosDB.findById(req.params.id);

    if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    const updatedVideo = videosDB.update(req.params.id, {
        title: title || video.title,
        description: description || video.description,
        courseId: courseId || video.courseId,
        status: status || video.status,
        lectureNumber: lectureNumber || video.lectureNumber,
        duration: duration || video.duration
    });

    res.json({ success: true, message: 'Video updated!', video: updatedVideo });
});

// ============ DELETE VIDEO ============
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    const video = videosDB.findById(req.params.id);
    if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found.' });
    }

    // Delete video file
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', video.filename);
    if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
    }

    // Delete thumbnail if exists
    if (video.thumbnailUrl) {
        const thumbPath = path.join(__dirname, '..', video.thumbnailUrl);
        if (fs.existsSync(thumbPath)) {
            fs.unlinkSync(thumbPath);
        }
    }

    videosDB.delete(req.params.id);
    res.json({ success: true, message: 'Video deleted successfully!' });
});

// ============ STREAM VIDEO (Range Request) ============
router.get('/stream/:filename', authenticateToken, (req, res) => {
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', req.params.filename);

    if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ success: false, message: 'Video file not found.' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

module.exports = router;