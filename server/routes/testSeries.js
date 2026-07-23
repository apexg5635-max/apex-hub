// ============================================
// TEST SERIES MANAGEMENT ROUTES
// ============================================
const express = require('express');
const Database = require('../models/data');
const { authenticateToken, isAdmin, isStudent } = require('../middleware/auth');

const router = express.Router();
const testSeriesDB = new Database('testSeries');
const questionsDB = new Database('questions');
const enrollmentsDB = new Database('enrollments');

// ============ CREATE TEST SERIES ============
router.post('/', authenticateToken, isAdmin, (req, res) => {
    try {
        const testSeries = testSeriesDB.create(req.body);
        res.status(201).json({ success: true, message: 'Test series created!', testSeries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating test series.' });
    }
});

// ============ GET ALL TEST SERIES ============
router.get('/', (req, res) => {
    const { category, status } = req.query;
    let tests = testSeriesDB.findAll();

    if (category) tests = tests.filter(t => t.category === category);
    if (status) tests = tests.filter(t => t.status === status);

    res.json({ success: true, tests, total: tests.length });
});

// ============ ADD QUESTIONS ============
router.post('/:testId/questions', authenticateToken, isAdmin, (req, res) => {
    try {
        const { testId } = req.params;
        const { questions } = req.body; // Array of question objects

        const addedQuestions = questions.map(q => {
            return questionsDB.create({
                ...q,
                testSeriesId: testId
            });
        });

        // Update question count
        const testSeries = testSeriesDB.findById(testId);
        const totalQuestions = questionsDB.findMany({ testSeriesId: testId }).length;
        testSeriesDB.update(testId, { totalQuestionsStored: totalQuestions });

        res.status(201).json({
            success: true,
            message: `${addedQuestions.length} questions added!`,
            questions: addedQuestions
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding questions.' });
    }
});

// ============ GET QUESTIONS FOR TEST ============
router.get('/:testId/questions', authenticateToken, isStudent, (req, res) => {
    const questions = questionsDB.findMany({ testSeriesId: req.params.testId });
    
    // Remove correct answers for student view
    const safeQuestions = questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        marks: q.marks || 1
    }));

    res.json({ success: true, questions: safeQuestions, total: safeQuestions.length });
});

// ============ SUBMIT TEST ANSWERS ============
router.post('/:testId/submit', authenticateToken, isStudent, (req, res) => {
    try {
        const { testId } = req.params;
        const { answers } = req.body; // { questionId: selectedOption }
        
        const questions = questionsDB.findMany({ testSeriesId: testId });
        let score = 0;
        let totalMarks = 0;
        
        const results = questions.map(q => {
            totalMarks += (q.marks || 1);
            const isCorrect = answers[q.id] === q.correctAnswer;
            if (isCorrect) score += (q.marks || 1);
            
            return {
                questionId: q.id,
                selectedAnswer: answers[q.id] || '',
                correctAnswer: q.correctAnswer,
                isCorrect,
                marks: q.marks || 1
            };
        });

        const resultData = {
            userId: req.user.id,
            testSeriesId: testId,
            score,
            totalMarks,
            percentage: Math.round((score / totalMarks) * 100),
            answers: results,
            submittedAt: new Date().toISOString()
        };

        enrollmentsDB.create({
            type: 'test_result',
            ...resultData
        });

        res.json({
            success: true,
            message: 'Test submitted!',
            result: {
                score,
                totalMarks,
                percentage: Math.round((score / totalMarks) * 100),
                totalQuestions: questions.length,
                correctAnswers: results.filter(r => r.isCorrect).length
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error submitting test.' });
    }
});

// ============ GET TEST RESULTS ============
router.get('/:testId/results', authenticateToken, (req, res) => {
    const results = enrollmentsDB.findMany({
        type: 'test_result',
        testSeriesId: req.params.testId,
        userId: req.user.id
    });

    res.json({ success: true, results });
});

// ============ PURCHASE TEST SERIES ============
router.post('/:testId/purchase', authenticateToken, isStudent, (req, res) => {
    const enrollment = enrollmentsDB.create({
        type: 'test_purchase',
        userId: req.user.id,
        testSeriesId: req.params.testId,
        purchasedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Test series purchased!', enrollment });
});

module.exports = router;