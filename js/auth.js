// ============================================
// APEX HUB - STUDENT AUTHENTICATION SYSTEM
// ============================================
// Features: Mobile OTP Login, Password Login, Registration
// Data stored in localStorage (Replace with API in production)
// ============================================

const AUTH_KEY = 'apexHubStudents';
const CURRENT_USER_KEY = 'apexHubCurrentUser';
const OTP_EXPIRY_MINUTES = 5;

// ============ STUDENT DATA STORE ============
function getStudentsDB() {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : [];
}

function saveStudentsDB(students) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(students));
}

// ============ GET CURRENT USER ============
function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
}

// ============ CHECK IF LOGGED IN ============
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return false;
    }
    return true;
}

// If already logged in, redirect to dashboard
function redirectIfLoggedIn() {
    const user = getCurrentUser();
    if (user) {
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

// ============ GENERATE OTP ============
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

// ============ SEND OTP (SIMULATED) ============
// In production: Use Twilio, MSG91, TextLocal, or Firebase Auth
function sendOTP(mobileNumber) {
    return new Promise((resolve, reject) => {
        // Validate mobile number
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobileNumber)) {
            reject(new Error('Please enter a valid 10-digit Indian mobile number'));
            return;
        }

        // Generate OTP
        const otp = generateOTP();
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);

        // Store OTP temporarily
        const otpData = {
            mobile: mobileNumber,
            otp: otp,
            expiry: expiryTime.getTime(),
            attempts: 0
        };
        localStorage.setItem('apexPendingOTP', JSON.stringify(otpData));

        // Simulate sending OTP (In production: Call SMS API)
        console.log('═══════════════════════════════════');
        console.log('📱 OTP sent to:', mobileNumber);
        console.log('🔢 OTP:', otp);
        console.log('⏰ Expires in:', OTP_EXPIRY_MINUTES, 'minutes');
        console.log('═══════════════════════════════════');
        
        // Show OTP in alert for demo
        setTimeout(() => {
            resolve({ success: true, message: 'OTP sent successfully! (Demo OTP: ' + otp + ')' });
        }, 1000);
    });
}

// ============ VERIFY OTP ============
function verifyOTP(mobileNumber, enteredOTP) {
    const otpData = JSON.parse(localStorage.getItem('apexPendingOTP'));

    if (!otpData) {
        return { success: false, message: 'No OTP found. Please request a new OTP.' };
    }

    if (otpData.mobile !== mobileNumber) {
        return { success: false, message: 'Mobile number mismatch. Please request a new OTP.' };
    }

    if (Date.now() > otpData.expiry) {
        localStorage.removeItem('apexPendingOTP');
        return { success: false, message: 'OTP has expired. Please request a new OTP.' };
    }

    if (otpData.attempts >= 3) {
        localStorage.removeItem('apexPendingOTP');
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    otpData.attempts++;
    localStorage.setItem('apexPendingOTP', JSON.stringify(otpData));

    if (otpData.otp !== enteredOTP) {
        return { success: false, message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.` };
    }

    // OTP verified successfully
    localStorage.removeItem('apexPendingOTP');
    return { success: true, message: 'OTP verified successfully!' };
}

// ============ REGISTER NEW STUDENT ============
function registerStudent(studentData) {
    const students = getStudentsDB();

    // Check if mobile already registered
    const existingUser = students.find(s => s.mobile === studentData.mobile);
    if (existingUser) {
        return { success: false, message: 'This mobile number is already registered. Please login instead.' };
    }

    // Check if email already registered
    if (studentData.email) {
        const existingEmail = students.find(s => s.email === studentData.email);
        if (existingEmail) {
            return { success: false, message: 'This email is already registered. Please login instead.' };
        }
    }

    // Create new student
    const newStudent = {
        id: 'STU' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase(),
        fullName: studentData.fullName,
        mobile: studentData.mobile,
        email: studentData.email || '',
        password: studentData.password ? btoa(studentData.password) : '', // Base64 encode (Use bcrypt in production)
        examPreparing: studentData.examPreparing || '',
        city: studentData.city || '',
        state: studentData.state || 'Chhattisgarh',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        enrolledCourses: [],
        testSeriesPurchased: [],
        walletBalance: 0
    };

    students.push(newStudent);
    saveStudentsDB(students);

    // Auto-login after registration
    const userForSession = { ...newStudent };
    delete userForSession.password; // Don't store password in session
    setCurrentUser(userForSession);

    return { success: true, message: 'Registration successful!', user: userForSession };
}

// ============ LOGIN WITH PASSWORD ============
function loginWithPassword(mobileOrEmail, password) {
    const students = getStudentsDB();
    
    const user = students.find(s => 
        (s.mobile === mobileOrEmail || s.email === mobileOrEmail) && 
        s.password === btoa(password)
    );

    if (!user) {
        return { success: false, message: 'Invalid credentials. Please check your mobile/email and password.' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    const index = students.findIndex(s => s.id === user.id);
    students[index] = user;
    saveStudentsDB(students);

    // Set current user (without password)
    const userForSession = { ...user };
    delete userForSession.password;
    setCurrentUser(userForSession);

    return { success: true, message: 'Login successful!', user: userForSession };
}

// ============ LOGIN WITH OTP ============
function loginWithOTP(mobileNumber) {
    const students = getStudentsDB();
    const user = students.find(s => s.mobile === mobileNumber);

    if (!user) {
        return { success: false, message: 'No account found with this mobile number. Please register first.', isNewUser: true };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    const index = students.findIndex(s => s.id === user.id);
    students[index] = user;
    saveStudentsDB(students);

    const userForSession = { ...user };
    delete userForSession.password;
    setCurrentUser(userForSession);

    return { success: true, message: 'Login successful!', user: userForSession };
}

// ============ UPDATE PROFILE ============
function updateProfile(updates) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Not logged in' };

    const students = getStudentsDB();
    const index = students.findIndex(s => s.id === currentUser.id);
    
    if (index === -1) return { success: false, message: 'User not found' };

    students[index] = { ...students[index], ...updates };
    saveStudentsDB(students);

    const updatedUser = { ...students[index] };
    delete updatedUser.password;
    setCurrentUser(updatedUser);

    return { success: true, message: 'Profile updated!', user: updatedUser };
}

// ============ CHANGE PASSWORD ============
function changePassword(oldPassword, newPassword) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Not logged in' };

    const students = getStudentsDB();
    const user = students.find(s => s.id === currentUser.id);

    if (!user) return { success: false, message: 'User not found' };
    if (user.password !== btoa(oldPassword)) {
        return { success: false, message: 'Current password is incorrect' };
    }

    user.password = btoa(newPassword);
    saveStudentsDB(students);
    return { success: true, message: 'Password changed successfully!' };
}

// ============ ENROLL IN COURSE ============
function enrollInCourse(courseId, courseName) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'Please login first' };

    const students = getStudentsDB();
    const index = students.findIndex(s => s.id === currentUser.id);

    if (index === -1) return { success: false, message: 'User not found' };

    if (!students[index].enrolledCourses) students[index].enrolledCourses = [];
    
    if (students[index].enrolledCourses.find(c => c.id === courseId)) {
        return { success: false, message: 'Already enrolled in this course' };
    }

    students[index].enrolledCourses.push({
        id: courseId,
        name: courseName,
        enrolledAt: new Date().toISOString(),
        progress: 0
    });

    saveStudentsDB(students);
    
    const updatedUser = { ...students[index] };
    delete updatedUser.password;
    setCurrentUser(updatedUser);

    return { success: true, message: 'Enrolled successfully!' };
}

// ============ CHECK AUTH STATE ============
function checkAuthState() {
    const user = getCurrentUser();
    return {
        isLoggedIn: !!user,
        user: user
    };
}

// ============ DEMO: CREATE TEST USER ============
function createDemoUser() {
    const students = getStudentsDB();
    const existingDemo = students.find(s => s.mobile === '9876543210');
    
    if (!existingDemo) {
        const demoUser = {
            id: 'STUDEMO001',
            fullName: 'Rahul Sahu (Demo)',
            mobile: '9876543210',
            email: 'rahul@example.com',
            password: btoa('student123'),
            examPreparing: 'CG PSC',
            city: 'Raipur',
            state: 'Chhattisgarh',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            enrolledCourses: [
                { id: 'cgpsc-foundation', name: 'CG PSC Foundation Batch 2025', enrolledAt: new Date().toISOString(), progress: 65 },
                { id: 'vyapam-combo', name: 'CG Vyapam Combo Pack', enrolledAt: new Date().toISOString(), progress: 45 }
            ],
            testSeriesPurchased: [
                { id: 'test-cgpsc-1', name: 'CG PSC Prelims Test Series 2025', purchasedAt: new Date().toISOString() }
            ],
            walletBalance: 500
        };
        students.push(demoUser);
        saveStudentsDB(students);
        console.log('✅ Demo student created: Mobile: 9876543210, Password: student123');
    }
}

// Initialize demo user on first load
document.addEventListener('DOMContentLoaded', function() {
    createDemoUser();
});

console.log('🔐 Apex Hub Auth System Ready');
console.log('📱 Demo Login: Mobile: 9876543210 | Password: student123');
console.log('📱 OTP Login: Enter any mobile, OTP shown in console/alert');