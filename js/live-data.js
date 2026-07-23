// ============================================
// APEX HUB - LIVE WEBSITE DATA LOADER
// ============================================
// This file loads data from the admin system
// and renders it on live website pages
// ============================================

const DATA_KEY = 'apexHubSiteData';

// ============ GET SITE DATA ============
function getLiveData() {
    try {
        const data = localStorage.getItem(DATA_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.warn('No admin data found, using defaults');
    }
    return null;
}

// ============ LISTEN FOR ADMIN CHANGES ============
// When admin saves changes, website updates automatically
window.addEventListener('storage', function(e) {
    if (e.key === DATA_KEY && e.newValue) {
        console.log('🔄 Admin data updated! Refreshing website content...');
        // Reload the page content without full refresh
        location.reload();
    }
});

// Also listen for custom events (same-tab updates)
window.addEventListener('siteDataUpdated', function(e) {
    console.log('🔄 Site data updated in same tab!');
    location.reload();
});

// ============ RENDER HERO SECTION ============
function renderHeroFromData() {
    const data = getLiveData();
    if (!data || !data.hero) return false;
    
    const hero = data.hero;
    
    // Update badge
    const badgeEl = document.querySelector('.hero-badge');
    if (badgeEl && hero.badge) badgeEl.textContent = hero.badge;
    
    // Update headline
    const headlineEl = document.querySelector('.hero-content h1');
    if (headlineEl && hero.headline) headlineEl.innerHTML = hero.headline;
    
    // Update subtitle
    const subtitleEl = document.querySelector('.hero-subtitle');
    if (subtitleEl && hero.subtitle) subtitleEl.innerHTML = hero.subtitle;
    
    // Update stats
    if (hero.stats && hero.stats.length > 0) {
        const statsContainer = document.querySelector('.hero-stats');
        if (statsContainer) {
            statsContainer.innerHTML = hero.stats.map((stat, index) => {
                let html = `
                    <div class="stat-item">
                        <span class="stat-number">${stat.value}${stat.suffix || ''}</span>
                        <span class="stat-label">${stat.label}</span>
                `;
                if (stat.isRating) {
                    html += `<div class="stars">★★★★★</div>`;
                }
                html += `</div>`;
                if (index < hero.stats.length - 1) {
                    html += `<div class="stat-divider"></div>`;
                }
                return html;
            }).join('');
        }
    }
    
    // Update buttons
    if (hero.buttons && hero.buttons.length > 0) {
        const buttonsContainer = document.querySelector('.hero-buttons');
        if (buttonsContainer) {
            buttonsContainer.innerHTML = hero.buttons.map(btn => {
                const btnClass = btn.type === 'primary' ? 'btn-primary' : 'btn-secondary';
                return `<button class="${btnClass}"><i class="fas ${btn.icon}"></i> ${btn.text}</button>`;
            }).join('');
        }
    }
    
    return true;
}

// ============ RENDER COURSES ============
function renderCoursesFromData(containerId = 'coursesGrid') {
    const data = getLiveData();
    if (!data || !data.courses) return false;
    
    const courses = data.courses.filter(c => c.status === 'published');
    const container = document.getElementById(containerId);
    if (!container) return false;
    
    container.innerHTML = courses.map(course => {
        const discount = course.originalPrice > 0 
            ? Math.round(((course.originalPrice - course.sellingPrice) / course.originalPrice) * 100) 
            : 0;
        
        const features = (course.features || []).map(f => 
            `<li><i class="fas fa-check-circle"></i> ${f}</li>`
        ).join('');
        
        return `
            <div class="category-card" data-aos="fade-up">
                <div class="card-icon" style="background:${course.color || 'linear-gradient(135deg, #667eea, #764ba2)'};">
                    <i class="fas ${course.icon || 'fa-landmark'}"></i>
                </div>
                <h3>${course.name}</h3>
                <p>${course.description || ''}</p>
                <ul class="card-features">${features}</ul>
                <div class="card-footer">
                    <span class="price">Starting at ₹${(course.sellingPrice || 0).toLocaleString()}</span>
                    <a href="pages/courses.html#${course.id}" class="btn-card">View Courses <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    }).join('');
    
    return true;
}

// ============ RENDER BATCHES ============
function renderBatchesFromData(containerId = 'batchesGrid') {
    const data = getLiveData();
    if (!data || !data.batches) return false;
    
    const batches = data.batches.filter(b => b.status !== 'ended');
    const container = document.getElementById(containerId);
    if (!container) return false;
    
    container.innerHTML = batches.map(batch => `
        <div class="batch-card ${batch.featured ? 'featured' : ''}" data-aos="flip-left">
            <div class="batch-tag ${batch.featured ? 'gold' : ''}">${batch.tag || 'New Batch'}</div>
            <h3>${batch.name}</h3>
            <div class="batch-info">
                <p><i class="fas fa-calendar"></i> Starts: ${formatDate(batch.startDate)}</p>
                <p><i class="fas fa-clock"></i> Duration: ${batch.duration}</p>
                <p><i class="fas fa-video"></i> Live Classes: ${batch.hours} Hours</p>
                <p><i class="fas fa-users"></i> Seats Left: ${batch.seatsLeft}/${batch.totalSeats}</p>
            </div>
            <div class="batch-timer">
                <span>Enrollment closes in: <strong>${batch.enrollmentDeadline}</strong></span>
            </div>
            <div class="batch-price">
                <span class="original-price">₹${(batch.originalPrice || 0).toLocaleString()}</span>
                <span class="discounted-price">₹${(batch.sellingPrice || 0).toLocaleString()}</span>
                ${batch.discount > 0 ? `<span class="discount-badge">${batch.discount}% OFF</span>` : ''}
            </div>
            <a href="pages/checkout.html" class="${batch.featured ? 'btn-enroll-gold' : 'btn-enroll'}">Enroll Now <i class="fas fa-arrow-right"></i></a>
        </div>
    `).join('');
    
    return true;
}

// ============ RENDER TESTIMONIALS ============
function renderTestimonialsFromData(containerId = 'testimonialSlider') {
    const data = getLiveData();
    if (!data || !data.testimonials) return false;
    
    const testimonials = data.testimonials.filter(t => t.featured);
    const container = document.getElementById(containerId);
    if (!container) return false;
    
    container.innerHTML = testimonials.map(t => {
        const initials = t.initials || t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatarColors = ['#426cf5', '#e91e63', '#ff9800', '#4caf50', '#9c27b0'];
        const colorIndex = testimonials.indexOf(t) % avatarColors.length;
        
        return `
            <div class="testimonial-card">
                <div class="testimonial-avatar">
                    <svg width="80" height="80">
                        <circle cx="40" cy="40" r="40" fill="${avatarColors[colorIndex]}"/>
                        <text x="40" y="50" text-anchor="middle" fill="white" font-size="30">${initials}</text>
                    </svg>
                </div>
                <div class="testimonial-content">
                    <div class="stars">${'★'.repeat(t.rating || 5)}${'☆'.repeat(5 - (t.rating || 5))}</div>
                    <p>"${t.review}"</p>
                    <h4>${t.name}</h4>
                    <span>${t.exam} ${t.year || ''} - ${t.rank || ''}</span>
                    <span class="badge ${t.badgeColor === 'green' ? 'green' : t.badgeColor === 'orange' ? 'orange' : ''}">${t.badge || t.exam}</span>
                </div>
            </div>
        `;
    }).join('');
    
    return true;
}

// ============ RENDER FACULTY ============
function renderFacultyFromData(containerId = 'facultyGrid') {
    const data = getLiveData();
    if (!data || !data.faculty) return false;
    
    const faculty = data.faculty.filter(f => f.status === 'active');
    const container = document.getElementById(containerId);
    if (!container) return false;
    
    container.innerHTML = faculty.map((f, i) => `
        <div class="faculty-card" data-aos="fade-up" data-aos-delay="${(i + 1) * 100}">
            <div class="faculty-image" style="background:${f.color};">
                <i class="fas ${f.icon || 'fa-user-tie'}"></i>
            </div>
            <div class="faculty-info">
                <h3>${f.name}</h3>
                <p class="designation">${f.designation}</p>
                <p class="subject">${f.subject}</p>
                <span class="experience">${f.experience}</span>
                ${f.qualification ? `<p style="font-size:0.8rem;margin-top:8px;color:var(--text-light);">${f.qualification}</p>` : ''}
            </div>
        </div>
    `).join('');
    
    return true;
}

// ============ RENDER TEST SERIES ============
function renderTestSeriesFromData(containerId = 'testSeriesGrid') {
    const data = getLiveData();
    if (!data || !data.testSeries) return false;
    
    const tests = data.testSeries.filter(t => t.status === 'published');
    const container = document.getElementById(containerId);
    if (!container) return false;
    
    const colors = {
        'CG PSC': 'linear-gradient(135deg, #667eea, #764ba2)',
        'CG Vyapam': 'linear-gradient(135deg, #f093fb, #f5576c)',
        'NEET': 'linear-gradient(135deg, #43e97b, #38f9d7)',
        'JEE': 'linear-gradient(135deg, #fa709a, #fee140)'
    };
    
    container.innerHTML = tests.map(t => `
        <div class="course-card" data-aos="fade-up">
            <div class="course-header" style="background:${colors[t.category] || colors['CG PSC']};${t.category === 'NEET' || t.category === 'JEE' ? 'color:#1a1a1a;' : ''}">
                ${t.featured ? '<span class="course-badge">⭐ Featured</span>' : ''}
                <h3>${t.name}</h3>
                <p>${t.type || 'Test Series'}</p>
            </div>
            <div class="course-body">
                <div class="course-meta">
                    <span><i class="fas fa-copy"></i> ${t.totalTests} Tests</span>
                    <span><i class="fas fa-question-circle"></i> ${t.questionsPerTest} Qs</span>
                </div>
                <p>✓ ${t.duration} mins per test<br>✓ ${t.totalMarks} Marks<br>✓ ${t.language}<br>✓ Instant Results<br>✓ Detailed Solutions</p>
            </div>
            <div class="course-footer">
                <span class="price">${t.sellingPrice === 0 ? 'FREE' : '₹' + t.sellingPrice.toLocaleString()} ${t.originalPrice > t.sellingPrice ? `<small style="text-decoration:line-through;color:#999;">₹${t.originalPrice.toLocaleString()}</small>` : ''}</span>
                <button class="btn-buy" onclick="addToCart('${t.id}', '${t.name}', ${t.sellingPrice})">Buy Now</button>
            </div>
        </div>
    `).join('');
    
    return true;
}

// ============ RENDER SITE SETTINGS ============
function applySiteSettings() {
    const data = getLiveData();
    if (!data || !data.site) return false;
    
    const site = data.site;
    
    // Update page title
    if (site.seo && site.seo.title) {
        document.title = site.seo.title;
    }
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && site.seo && site.seo.description) {
        metaDesc.setAttribute('content', site.seo.description);
    }
    
    // Update contact info in footer
    document.querySelectorAll('.contact-info').forEach(el => {
        const phoneLink = el.querySelector('a[href^="tel:"]');
        const emailLink = el.querySelector('a[href^="mailto:"]');
        if (phoneLink && site.phone) phoneLink.textContent = site.phone;
        if (emailLink && site.email) emailLink.textContent = site.email;
    });
    
    // Update social links
    if (site.social) {
        const socialLinks = document.querySelectorAll('.social-links a');
        const platforms = ['youtube', 'instagram', 'facebook', 'telegram', 'whatsapp'];
        socialLinks.forEach((link, i) => {
            if (platforms[i] && site.social[platforms[i]]) {
                link.href = site.social[platforms[i]];
            }
        });
    }
    
    // Update WhatsApp float button
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn && site.social && site.social.whatsapp) {
        whatsappBtn.href = `https://wa.me/${site.social.whatsapp.replace(/[^0-9]/g, '')}`;
    }
    
    return true;
}

// ============ RENDER BLOG POSTS ============
function renderBlogFromData(containerId = 'blogGrid') {
    const data = getLiveData();
    if (!data || !data.blog) return false;
    
    const posts = data.blog.filter(p => p.status === 'published');
    const container = document.getElementById(containerId);
    if (!container) return false;
    
    const bgColors = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8'];
    const icons = ['fa-trophy', 'fa-flask', 'fa-calculator', 'fa-brain', 'fa-map-marked-alt', 'fa-user-graduate', 'fa-calendar-alt', 'fa-heart'];
    
    container.innerHTML = posts.map((post, i) => `
        <div class="blog-card" data-aos="fade-up" data-aos-delay="${(i + 1) * 100}">
            <div class="blog-card-image ${bgColors[i % bgColors.length]}">
                <i class="fas ${post.icon || icons[i % icons.length]}"></i>
                <span class="blog-card-category">${post.category}</span>
            </div>
            <div class="blog-card-body">
                <div class="meta"><span><i class="fas fa-calendar"></i> ${formatDate(post.date)}</span></div>
                <h3><a href="#">${post.title}</a></h3>
                <p>${post.excerpt || ''}</p>
                <div class="blog-card-footer">
                    <span class="read-time"><i class="fas fa-clock"></i> ${post.readTime || '5 min read'}</span>
                    <a href="#" class="read-more">Read More →</a>
                </div>
            </div>
        </div>
    `).join('');
    
    return true;
}

// ============ RENDER FAQ ============
function renderFaqFromData(containerId = 'faqList') {
    const data = getLiveData();
    if (!data || !data.pages || !data.pages.faq) return false;
    
    const faqs = data.pages.faq;
    const container = document.getElementById(containerId);
    if (!container) return false;
    
    container.innerHTML = faqs.map((faq, i) => `
        <div class="faq-item" data-aos="fade-up">
            <div class="faq-question" onclick="this.parentElement.classList.toggle('active')">
                <span>${faq.question}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
                <p>${faq.answer}</p>
            </div>
        </div>
    `).join('');
    
    return true;
}

// ============ UTILITY FUNCTIONS ============
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

// ============ INITIALIZE ON PAGE LOAD ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Apex Hub Live Data System Initialized');
    console.log('📡 Listening for admin changes...');
    
    // Apply site-wide settings
    applySiteSettings();
    
    // Auto-detect which page we're on and render appropriate content
    const page = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(page) {
        case 'index.html':
        case '':
            renderHeroFromData();
            renderCoursesFromData('categoryGrid');
            renderBatchesFromData('batchesContainer');
            renderTestimonialsFromData('testimonialContainer');
            break;
        case 'courses.html':
            renderCoursesFromData('coursesGrid');
            renderTestSeriesFromData('testSeriesGrid');
            break;
        case 'about.html':
            renderFacultyFromData('facultyGrid');
            break;
        case 'blog.html':
            renderBlogFromData('blogMainGrid');
            break;
        case 'faq.html':
            renderFaqFromData('faqContainer');
            break;
    }
});

console.log('✅ Live data loader ready - Website will update automatically when admin makes changes');