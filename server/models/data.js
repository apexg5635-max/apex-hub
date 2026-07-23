// ============================================
// APEX HUB - FILE-BASED DATABASE
// ============================================
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Create data directory if not exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============ DATABASE FILES ============
const DB_FILES = {
    users: path.join(DATA_DIR, 'users.json'),
    courses: path.join(DATA_DIR, 'courses.json'),
    videos: path.join(DATA_DIR, 'videos.json'),
    liveClasses: path.join(DATA_DIR, 'liveClasses.json'),
    testSeries: path.join(DATA_DIR, 'testSeries.json'),
    questions: path.join(DATA_DIR, 'questions.json'),
    enrollments: path.join(DATA_DIR, 'enrollments.json'),
    batches: path.join(DATA_DIR, 'batches.json'),
    siteData: path.join(DATA_DIR, 'siteData.json')
};

// ============ INITIALIZE DATABASES ============
const defaultData = {
    users: [
        {
            id: 'admin-001',
            fullName: 'Admin User',
            mobile: '9876543210',
            email: 'admin@apexhub.in',
            password: '$2a$10$XQx5q5q5q5q5q5q5q5q5qO', // admin123 (bcrypt)
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        {
            id: 'stu-001',
            fullName: 'Rahul Sahu',
            mobile: '9876543211',
            email: 'rahul@example.com',
            password: '$2a$10$XQx5q5q5q5q5q5q5q5q5qO', // student123
            role: 'student',
            examPreparing: 'CG PSC',
            city: 'Raipur',
            createdAt: new Date().toISOString()
        }
    ],
    courses: [],
    videos: [],
    liveClasses: [],
    testSeries: [],
    questions: [],
    enrollments: [],
    batches: [],
    siteData: {}
};

// Initialize all database files
Object.entries(DB_FILES).forEach(([name, filePath]) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData[name] || [], null, 2));
        console.log('✅ Created database:', name);
    }
});

// ============ CRUD OPERATIONS ============
class Database {
    constructor(collectionName) {
        this.filePath = DB_FILES[collectionName];
        if (!this.filePath) throw new Error('Invalid collection: ' + collectionName);
    }

    read() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            return [];
        }
    }

    write(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    findAll() {
        return this.read();
    }

    findById(id) {
        const items = this.read();
        return items.find(item => item.id === id);
    }

    findOne(query) {
        const items = this.read();
        return items.find(item => {
            return Object.entries(query).every(([key, value]) => item[key] === value);
        });
    }

    findMany(query) {
        const items = this.read();
        return items.filter(item => {
            return Object.entries(query).every(([key, value]) => item[key] === value);
        });
    }

    create(item) {
        const items = this.read();
        item.id = item.id || this.generateId();
        item.createdAt = item.createdAt || new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        items.push(item);
        this.write(items);
        return item;
    }

    update(id, updates) {
        const items = this.read();
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;
        items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
        this.write(items);
        return items[index];
    }

    delete(id) {
        const items = this.read();
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return false;
        items.splice(index, 1);
        this.write(items);
        return true;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
    }

    count(query = {}) {
        return this.findMany(query).length;
    }
}

module.exports = Database;