// Initialize AOS animations
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking a nav link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Counter animation
const counters = document.querySelectorAll('.counter');
const speed = 200;

counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 1);
        } else {
            counter.innerText = target;
        }
    };
    
    // Trigger counter when in viewport
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            updateCount();
            observer.unobserve(counter);
        }
    });
    
    observer.observe(counter);
});

// Explore courses from hero search
function exploreCourses() {
    const exam = document.getElementById('examSelect').value;
    if (exam) {
        window.location.href = `pages/courses.html#${exam}`;
    } else {
        window.location.href = 'pages/courses.html';
    }
}

// Sticky navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255,255,255,0.98)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add to cart functionality (localStorage)
function addToCart(courseId, courseName, price) {
    let cart = JSON.parse(localStorage.getItem('apexCart')) || [];
    
    const existingItem = cart.find(item => item.id === courseId);
    if (existingItem) {
        alert('This course is already in your cart!');
        return;
    }
    
    cart.push({
        id: courseId,
        name: courseName,
        price: price
    });
    
    localStorage.setItem('apexCart', JSON.stringify(cart));
    updateCartCount();
    alert(`${courseName} added to cart!`);
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('apexCart')) || [];
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
        cartCountElement.style.display = cart.length > 0 ? 'inline' : 'none';
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});

// Free demo class modal (placeholder)
document.querySelector('.btn-free-demo')?.addEventListener('click', (e) => {
    e.preventDefault();
    alert('📞 Our counsellor will call you shortly to schedule a free demo class!\n\nOr call us directly: +91 98765 43210');
});

// Newsletter subscription (placeholder)
function subscribeNewsletter(email) {
    if (email && email.includes('@')) {
        alert('✅ Thank you for subscribing! Check your email for free study material.');
        return true;
    }
    alert('Please enter a valid email address.');
    return false;
}