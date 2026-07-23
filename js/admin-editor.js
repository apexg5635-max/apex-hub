// ==========================================
// APEX HUB - CENTRAL DATA MANAGEMENT SYSTEM
// ==========================================
// All website content is stored here and editable from admin panel
// In production: Replace localStorage with API calls to backend

const ADMIN_DATA_KEY = 'apexHubSiteData';
const ADMIN_AUTH_KEY = 'apexAdminLoggedIn';

// ============ DEFAULT SITE DATA ============
const defaultSiteData = {
    site: {
        name: 'Apex Hub',
        tagline: 'Climb to the Peak',
        phone: '+91 98765 43210',
        email: 'info@apexhub.in',
        address: '2nd Floor, Apex Hub Tower, GE Road, Raipur, Chhattisgarh - 492001',
        workingHours: 'Mon-Sun: 9:00 AM - 8:00 PM',
        social: {
            youtube: 'https://youtube.com/@apexhub',
            instagram: 'https://instagram.com/apexhub',
            facebook: 'https://facebook.com/apexhub',
            telegram: 'https://t.me/apexhub',
            whatsapp: '919876543210'
        },
        seo: {
            title: 'Apex Hub - Chhattisgarh\'s #1 Coaching for CG PSC, Vyapam, NEET & JEE',
            description: 'Apex Hub provides top-quality online coaching for CG PSC, CG Vyapam, NEET, and JEE exams.',
            keywords: 'CG PSC coaching, CG Vyapam, NEET coaching, JEE coaching, Chhattisgarh coaching'
        }
    },

    hero: {
        badge: '🏆 Chhattisgarh\'s Most Trusted Coaching Platform',
        headline: 'Your Gateway to <span class="text-gold">Government Jobs</span> & <span class="text-gold">Top Medical & Engineering Colleges</span>',
        subtitle: 'Expert coaching for <strong>CG PSC, CG Vyapam, NEET, and JEE</strong> with live interactive classes, comprehensive study material, and personalized mentorship — all from the comfort of your home.',
        stats: [
            { label: 'Active Students', value: 5000, suffix: '+' },
            { label: 'Selections in 2024', value: 200, suffix: '+' },
            { label: 'Rating', value: 4.9, suffix: '', isRating: true }
        ],
        buttons: [
            { text: 'Watch Demo Lectures', icon: 'fa-video', link: '#', type: 'primary' },
            { text: 'Download Free Study Material', icon: 'fa-download', link: '#', type: 'secondary' }
        ]
    },

    courses: [
        {
            id: 'cgpsc-foundation',
            name: 'CG PSC Foundation Batch 2025',
            category: 'CG PSC',
            type: 'Foundation Batch',
            description: 'Complete preparation for CGPSC State Service Exam — Prelims, Mains & Interview',
            features: [
                'Complete GS + Aptitude Coverage',
                'Chhattisgarh Special Modules',
                'Answer Writing Practice',
                'Mock Interview Sessions'
            ],
            originalPrice: 7999,
            sellingPrice: 4999,
            duration: '10 Months',
            hours: '300+',
            students: 1245,
            rating: 4.8,
            status: 'published',
            icon: 'fa-landmark',
            color: 'linear-gradient(135deg, #667eea, #764ba2)',
            order: 1
        },
        {
            id: 'vyapam-combo',
            name: 'CG Vyapam Combo Pack',
            category: 'CG Vyapam',
            type: 'Combo Pack',
            description: 'Crack Vyapam exams like Patwari, SI, Teacher, Assistant & other state-level posts',
            features: [
                'Subject-wise Expert Faculty',
                '10,000+ Practice Questions',
                'Speed & Accuracy Training',
                'Previous Year Paper Analysis'
            ],
            originalPrice: 3999,
            sellingPrice: 2499,
            duration: '6 Months',
            hours: '200+',
            students: 980,
            rating: 4.7,
            status: 'published',
            icon: 'fa-building-columns',
            color: 'linear-gradient(135deg, #f093fb, #f5576c)',
            order: 2
        },
        {
            id: 'neet-dropper',
            name: 'NEET Dropper Batch 2026',
            category: 'NEET',
            type: 'Dropper Batch',
            description: 'Expert coaching for NEET-UG with focus on PCB — Physics, Chemistry & Biology',
            features: [
                'NCERT-Based Teaching',
                'Daily Practice Problems (DPP)',
                'All India Test Series',
                'Doubt Resolution within 24 hrs'
            ],
            originalPrice: 9999,
            sellingPrice: 6999,
            duration: '12 Months',
            hours: '500+',
            students: 2890,
            rating: 4.9,
            status: 'published',
            icon: 'fa-stethoscope',
            color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            order: 3
        },
        {
            id: 'jee-main-adv',
            name: 'JEE Main + Advanced 2026',
            category: 'JEE',
            type: 'Comprehensive',
            description: 'JEE Main + Advanced preparation with IITian faculty and structured learning modules',
            features: [
                'PCM Expert Faculty (IITians)',
                'Chapter-wise Tests',
                'Advanced Problem Solving',
                'Rank Booster Program'
            ],
            originalPrice: 14999,
            sellingPrice: 8999,
            duration: '24 Months',
            hours: '600+',
            students: 750,
            rating: 4.8,
            status: 'draft',
            icon: 'fa-cogs',
            color: 'linear-gradient(135deg, #fa709a, #fee140)',
            order: 4
        }
    ],

    batches: [
        {
            id: 'batch-1',
            courseId: 'cgpsc-foundation',
            name: 'CG PSC Foundation Batch 2025',
            startDate: '2025-08-01',
            duration: '10 Months',
            hours: '300+',
            seatsLeft: 45,
            totalSeats: 100,
            originalPrice: 7999,
            sellingPrice: 4999,
            discount: 38,
            tag: '🔥 Trending',
            featured: false,
            enrollmentDeadline: '15 Days',
            status: 'upcoming'
        },
        {
            id: 'batch-2',
            courseId: 'neet-dropper',
            name: 'NEET Dropper Batch 2026',
            startDate: '2025-07-15',
            duration: '12 Months',
            hours: '500+',
            seatsLeft: 28,
            totalSeats: 80,
            originalPrice: 9999,
            sellingPrice: 6999,
            discount: 30,
            tag: '⭐ Most Popular',
            featured: true,
            enrollmentDeadline: '5 Days',
            status: 'upcoming'
        },
        {
            id: 'batch-3',
            courseId: 'vyapam-combo',
            name: 'CG Vyapam Combo Pack',
            startDate: '2025-07-20',
            duration: '6 Months',
            hours: '200+',
            seatsLeft: 60,
            totalSeats: 150,
            originalPrice: 3999,
            sellingPrice: 2499,
            discount: 38,
            tag: '🆕 New',
            featured: false,
            enrollmentDeadline: '20 Days',
            status: 'upcoming'
        }
    ],

    testimonials: [
        {
            id: 'test-1',
            name: 'Rahul Sahu',
            initials: 'RS',
            exam: 'CG PSC',
            rank: 'Rank 23',
            year: '2024',
            rating: 5,
            review: 'Apex Hub\'s CG PSC course is the best in Chhattisgarh. The faculty explains every topic in simple Hindi-English mix. I cleared CGPSC 2024 with Rank 23. The answer writing practice was the game-changer!',
            badge: 'CG PSC',
            badgeColor: 'primary',
            featured: true,
            order: 1
        },
        {
            id: 'test-2',
            name: 'Priya Verma',
            initials: 'PV',
            exam: 'NEET',
            rank: 'AIR 1542',
            year: '2024',
            rating: 5,
            review: 'I was struggling with NEET Physics. Joined Apex Hub\'s NEET crash course and within 3 months, my score jumped from 80 to 160. The DPPs and test series are exactly like the real exam!',
            badge: 'NEET',
            badgeColor: 'green',
            featured: true,
            order: 2
        },
        {
            id: 'test-3',
            name: 'Amit Sharma',
            initials: 'AS',
            exam: 'JEE',
            rank: 'AIR 892',
            year: '2024',
            rating: 5,
            review: 'JEE Advanced seemed impossible until I joined Apex Hub. The IITian faculty knows exactly what JEE demands. Their advanced problem-solving sessions cracked the code for me!',
            badge: 'JEE',
            badgeColor: 'orange',
            featured: true,
            order: 3
        }
    ],

    faculty: [
        {
            id: 'fac-1',
            name: 'Dr. Rajesh Sharma',
            designation: 'Senior Faculty - CG PSC',
            subject: 'Indian Polity & Governance',
            experience: '15+ Years',
            qualification: 'Ex-CGPSC Officer, M.A. Political Science',
            bio: 'Former CGPSC officer with 15+ years of teaching experience. Known for making complex constitutional concepts simple for students.',
            email: 'rajesh@apexhub.in',
            phone: '',
            icon: 'fa-user-tie',
            color: 'linear-gradient(135deg, #667eea, #764ba2)',
            status: 'active',
            order: 1
        },
        {
            id: 'fac-2',
            name: 'Dr. Priya Patel',
            designation: 'HOD - NEET Biology',
            subject: 'Botany & Zoology',
            experience: '12+ Years',
            qualification: 'MBBS, AIIMS Raipur | 500+ Doctors Produced',
            bio: 'AIIMS Raipur graduate. Has produced over 500 doctors. Specializes in making NCERT Biology easy and highly scoring.',
            email: 'priya@apexhub.in',
            phone: '',
            icon: 'fa-user-md',
            color: 'linear-gradient(135deg, #f093fb, #f5576c)',
            status: 'active',
            order: 2
        },
        {
            id: 'fac-3',
            name: 'Prof. Amit Verma',
            designation: 'HOD - JEE Chemistry',
            subject: 'Physical & Organic Chemistry',
            experience: '10+ Years',
            qualification: 'M.Sc. Chemistry, IIT Bombay',
            bio: 'IIT Bombay alumnus. Expert in making Organic Chemistry visual and memorable. Over 1000 students now in IITs.',
            email: 'amit@apexhub.in',
            phone: '',
            icon: 'fa-flask',
            color: 'linear-gradient(135deg, #43e97b, #38f9d7)',
            status: 'active',
            order: 3
        },
        {
            id: 'fac-4',
            name: 'Er. Suresh Kumar',
            designation: 'Senior Faculty - JEE Maths',
            subject: 'Calculus & Algebra',
            experience: '14+ Years',
            qualification: 'B.Tech, IIT Delhi | 1000+ IITians Produced',
            bio: 'IIT Delhi graduate with 14 years of JEE coaching experience. Known for shortcut techniques and conceptual clarity.',
            email: 'suresh@apexhub.in',
            phone: '',
            icon: 'fa-calculator',
            color: 'linear-gradient(135deg, #fa709a, #fee140)',
            status: 'active',
            order: 4
        }
    ],

    blog: [
        {
            id: 'blog-1',
            title: 'CGPSC 2025: Complete Strategy Guide for Prelims, Mains & Interview — By Rank 23 Holder',
            slug: 'cgpsc-2025-strategy-guide',
            category: 'CG PSC',
            author: 'Dr. Rajesh Sharma',
            date: '2025-07-20',
            readTime: '15 min',
            views: 12500,
            comments: 48,
            excerpt: 'A comprehensive, step-by-step guide to crack CGPSC 2025. Learn the exact strategy, booklist, time management, and answer writing techniques that helped me secure Rank 23 in my first attempt.',
            content: '<h2>Introduction</h2><p>Full article content goes here. This is editable from the admin panel.</p>',
            imageColor: 'linear-gradient(135deg, #667eea, #764ba2)',
            icon: 'fa-trophy',
            status: 'published',
            featured: true,
            tags: ['CGPSC', 'Strategy', 'Prelims', 'Mains']
        },
        {
            id: 'blog-2',
            title: 'NEET 2026: 5 Common Mistakes Droppers Make and How to Avoid Them',
            slug: 'neet-2026-dropper-mistakes',
            category: 'NEET',
            author: 'Dr. Priya Patel',
            date: '2025-07-18',
            readTime: '8 min',
            views: 8900,
            comments: 35,
            excerpt: 'Dropping a year for NEET is a big decision. Avoid these 5 critical mistakes that most droppers make unknowingly.',
            content: '<h2>Mistake #1</h2><p>Content goes here...</p>',
            imageColor: 'linear-gradient(135deg, #f093fb, #f5576c)',
            icon: 'fa-flask',
            status: 'published',
            featured: false,
            tags: ['NEET', 'Dropper', 'Tips']
        }
    ],

    pages: {
        about: {
            heroTitle: 'About Apex Hub',
            heroSubtitle: 'Chhattisgarh\'s Most Trusted Coaching Platform Since 2018',
            storyTitle: 'Our Story',
            storyContent: '<p>Apex Hub was born in 2018 with a simple yet powerful vision: every student in Chhattisgarh deserves access to world-class coaching, regardless of their location or financial background.</p><p>Founded by a group of IITians, doctors, and civil servants from Chhattisgarh, we understood the challenges faced by students in Tier-2 and Tier-3 cities.</p>',
            mission: 'To democratize competitive exam preparation by providing affordable, high-quality, bilingual coaching to every student in Chhattisgarh and beyond.',
            vision: 'To become India\'s most trusted regional coaching platform, producing 1000+ government officers, doctors, and engineers from Chhattisgarh every year by 2030.',
            values: 'Student-first approach, uncompromising quality, affordability, innovation in teaching, and deep commitment to Chhattisgarh\'s educational development.',
            timeline: [
                { year: '2018', title: 'The Beginning', description: 'Founded in Raipur with 3 faculty and 50 students.' },
                { year: '2019', title: 'Expansion', description: 'Added NEET & JEE coaching. Student base grew to 500.' },
                { year: '2020', title: 'Going Online', description: 'Launched full online platform during pandemic.' },
                { year: '2022', title: '100+ Selections', description: 'Crossed 100 selections in a single year.' },
                { year: '2024', title: '5000+ Students', description: 'Became Chhattisgarh\'s #1 online coaching platform.' }
            ]
        },
        faq: [
            {
                id: 'faq-1',
                question: 'What is Apex Hub and what courses do you offer?',
                answer: 'Apex Hub is Chhattisgarh\'s premier online coaching platform. We offer comprehensive courses for CG PSC, CG Vyapam, NEET, and JEE. All courses include live interactive classes, recorded lectures, study material, test series, and doubt resolution.',
                category: 'General'
            },
            {
                id: 'faq-2',
                question: 'How do live classes work? What if I miss a class?',
                answer: 'Live classes are conducted on our secure platform. You\'ll receive class links 30 minutes before the session. All live classes are recorded and uploaded within 2 hours. You can watch them anytime from your dashboard.',
                category: 'Classes'
            },
            {
                id: 'faq-3',
                question: 'What is your refund policy?',
                answer: 'We offer a 7-day no-questions-asked refund policy from the batch start date. If you\'re not satisfied, you\'ll get a full refund within 7 working days.',
                category: 'Payments'
            }
        ],
        privacy: {
            lastUpdated: '2025-07-01',
            version: '2.1',
            sections: [
                { id: 'privacy-policy', title: 'Privacy Policy', content: '<p>At Apex Hub, we are committed to protecting your privacy...</p>' },
                { id: 'terms-of-service', title: 'Terms of Service', content: '<p>By accessing or using Apex Hub services, you agree to these terms...</p>' },
                { id: 'refund-policy', title: 'Refund & Cancellation Policy', content: '<p>We offer flexible refund options as detailed below...</p>' }
            ]
        }
    },

    lastUpdated: new Date().toISOString()
};

// ============ CORE DATA FUNCTIONS ============

// Get all site data
function getSiteData() {
    const data = localStorage.getItem(ADMIN_DATA_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Error parsing site data, resetting to defaults');
            saveSiteData(defaultSiteData);
            return defaultSiteData;
        }
    }
    saveSiteData(defaultSiteData);
    return defaultSiteData;
}

// Save all site data
function saveSiteData(data) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(data));
    // Dispatch event so live pages can update
    window.dispatchEvent(new CustomEvent('siteDataUpdated', { detail: data }));
}

// Get specific section
function getSection(sectionName) {
    const data = getSiteData();
    return data[sectionName] || null;
}

// Update specific section
function updateSection(sectionName, sectionData) {
    const data = getSiteData();
    data[sectionName] = sectionData;
    saveSiteData(data);
    return data;
}

// Add item to a list section
function addItem(sectionName, item) {
    const data = getSiteData();
    if (!data[sectionName]) data[sectionName] = [];
    item.id = item.id || sectionName.slice(0, -1) + '-' + Date.now();
    data[sectionName].push(item);
    saveSiteData(data);
    return item;
}

// Update item in a list section
function updateItem(sectionName, itemId, updatedItem) {
    const data = getSiteData();
    const index = data[sectionName].findIndex(item => item.id === itemId);
    if (index !== -1) {
        data[sectionName][index] = { ...data[sectionName][index], ...updatedItem };
        saveSiteData(data);
        return data[sectionName][index];
    }
    return null;
}

// Delete item from a list section
function deleteItem(sectionName, itemId) {
    const data = getSiteData();
    const index = data[sectionName].findIndex(item => item.id === itemId);
    if (index !== -1) {
        data[sectionName].splice(index, 1);
        saveSiteData(data);
        return true;
    }
    return false;
}

// Reorder items
function reorderItems(sectionName, fromIndex, toIndex) {
    const data = getSiteData();
    const items = data[sectionName];
    const item = items.splice(fromIndex, 1)[0];
    items.splice(toIndex, 0, item);
    items.forEach((item, index) => { item.order = index + 1; });
    saveSiteData(data);
}

// Reset all data to defaults
function resetAllData() {
    if (confirm('⚠️ WARNING: This will reset ALL website data to factory defaults!\n\nAll your customizations will be lost. Continue?')) {
        localStorage.removeItem(ADMIN_DATA_KEY);
        saveSiteData(defaultSiteData);
        alert('✅ All data reset to defaults. Refreshing...');
        location.reload();
    }
}

// Export data as JSON file
function exportAllData() {
    const data = getSiteData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apex-hub-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Data exported successfully!');
}

// Import data from JSON file
function importAllData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm('⚠️ This will replace ALL current data with the imported data. Continue?')) {
                saveSiteData(data);
                alert('✅ Data imported successfully! Refreshing...');
                location.reload();
            }
        } catch (err) {
            alert('❌ Invalid JSON file. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

// ============ AUTHENTICATION ============
function checkAdminAuth() {
    if (localStorage.getItem(ADMIN_AUTH_KEY) !== 'true') {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function adminLogout() {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem('apexAdminUser');
    window.location.href = 'index.html';
}

// ============ UTILITY FUNCTIONS ============
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

function generateId(prefix) {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 14px 20px; border-radius: 10px; color: white;
        font-family: 'Poppins', sans-serif; font-size: 0.9rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'exclamation-triangle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animation styles
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
`;
document.head.appendChild(toastStyle);

// Initialize
console.log('🚀 Apex Hub Admin Editor loaded');
console.log('📊 Data stored in localStorage key:', ADMIN_DATA_KEY);
console.log('💡 All sections are now editable from admin panel');