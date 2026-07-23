// ============================================
// AUTH ROUTES
// ============================================
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('../models/data');

const router = express.Router();
const usersDB = new Database('users');

// ============ REGISTER ============
router.post('/register', async (req, res) => {
    try {
        const { fullName, mobile, email, password, examPreparing, city } = req.body;

        // Check existing user
        const existingUser = usersDB.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Mobile number already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = usersDB.create({
            fullName,
            mobile,
            email: email || '',
            password: hashedPassword,
            role: 'student',
            examPreparing: examPreparing || '',
            city: city || '',
            enrolledCourses: [],
            testSeriesPurchased: []
        });

        // Generate token
        const token = jwt.sign(
            { id: user.id, mobile: user.mobile, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// ============ LOGIN ============
router.post('/login', async (req, res) => {
    try {
        const { identifier, password, loginType } = req.body;

        // Find user by mobile or email
        const user = usersDB.findOne({ mobile: identifier }) || usersDB.findOne({ email: identifier });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Update last login
        usersDB.update(user.id, { lastLogin: new Date().toISOString() });

        // Generate token
        const token = jwt.sign(
            { id: user.id, mobile: user.mobile, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// ============ GET PROFILE ============
router.get('/profile', require('../middleware/auth').authenticateToken, (req, res) => {
    const user = usersDB.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
});

// ============ OTP SEND (Simulated) ============
router.post('/send-otp', (req, res) => {
    const { mobile } = req.body;
    
    // Validate mobile
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
        return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production: Send OTP via SMS API (Twilio, MSG91, etc.)
    console.log(`📱 OTP for ${mobile}: ${otp}`);

    res.json({
        success: true,
        message: 'OTP sent successfully!',
        otp: otp // Remove in production, send via SMS only
    });
});

module.exports = router;