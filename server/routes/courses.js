// ============================================
// COURSE MANAGEMENT ROUTES
// ============================================
const express = require('express');
const Database = require('../models/data');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();
const coursesDB = new Database('courses');
const enrollmentsDB = new Database('enrollments');

// ============ CREATE COURSE ============
router.post('/', authenticateToken, isAdmin, (req, res) => {
    const course = coursesDB.create(req.body);
    res.status(201).json({ success: true, message: 'Course created!', course });
});

// ============ GET ALL COURSES ============
router.get('/', (req, res) => {
    const courses = coursesDB.findAll();
    res.json({ success: true, courses, total: courses.length });
});

// ============ GET SINGLE COURSE ============
router.get('/:id', (req, res) => {
    const course = coursesDB.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, course });
});

// ============ UPDATE COURSE ============
router.put('/:id', authenticateToken, isAdmin, (req, res) => {
    const course = coursesDB.update(req.params.id, req.body);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, message: 'Course updated!', course });
});

// ============ DELETE COURSE ============
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    coursesDB.delete(req.params.id);
    res.json({ success: true, message: 'Course deleted.' });
});

// ============ ENROLL IN COURSE ============
router.post('/:id/enroll', authenticateToken, (req, res) => {
    const enrollment = enrollmentsDB.create({
        type: 'course_enrollment',
        userId: req.user.id,
        courseId: req.params.id,
        enrolledAt: new Date().toISOString(),
        progress: 0
    });

    res.json({ success: true, message: 'Enrolled successfully!', enrollment });
});

module.exports = router;