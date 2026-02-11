// ===== Cursor Glow Effect =====
const cursorGlow = document.querySelector('.cursor-glow');

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// ===== Mobile Menu Toggle =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== Scroll Animations =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe project cards
document.querySelectorAll('.project-card').forEach(card => {
    observer.observe(card);
});

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// ===== Navigation Background on Scroll =====
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        nav.style.padding = '0.75rem 2rem';
        nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.05)';
    } else {
        nav.style.padding = '1rem 2rem';
        nav.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// ===== Counter Animation =====
const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
};

// Observe stats for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const countElement = entry.target.querySelector('.stat-number[data-count]');
            if (countElement) {
                const target = parseInt(countElement.getAttribute('data-count'));
                animateCounter(countElement, target);
            }
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// ===== Parallax Effect on Shapes =====
document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// ===== Add stagger animation delay to project cards =====
document.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 100}ms`;
});

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Add visible class to hero elements after small delay
    setTimeout(() => {
        document.querySelectorAll('.animate-in').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }, 100);
});

// ===== Newsletter Subscription Form (Buttondown Embed) =====
const newsletterForm = document.getElementById('newsletterForm');
const emailInput = document.getElementById('bd-email');
const formMessage = document.getElementById('formMessage');

if (newsletterForm && emailInput && formMessage) {

    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Basic email validation
        if (!email || !email.includes('@')) {
            formMessage.textContent = '❌ Please enter a valid email address.';
            formMessage.className = 'form-message error';
            return;
        }
        
        const submitButton = newsletterForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Disable form during submission
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Subscribing...</span>';
        formMessage.textContent = '';
        formMessage.className = 'form-message';
        
        try {
            // Submit to Buttondown's embed endpoint
            const formData = new FormData();
            formData.append('email', email);
            
            const response = await fetch('https://buttondown.com/api/emails/embed-subscribe/hakanalsancak', {
                method: 'POST',
                body: formData,
                referrerPolicy: 'unsafe-url'
            });
            
            // Buttondown returns HTML on success, so we check status
            if (response.ok || response.status === 200) {
                formMessage.textContent = '🎉 Successfully subscribed! Check your email for confirmation.';
                formMessage.className = 'form-message success';
                emailInput.value = '';
            } else {
                // Try to parse error if available
                const text = await response.text();
                throw new Error('Subscription failed. Please try again.');
            }
            
        } catch (error) {
            console.error('Subscription error:', error);
            
            // User-friendly error messages
            let errorMsg = 'Something went wrong. Please try again later.';
            
            if (error && typeof error.message === 'string') {
                errorMsg = error.message;
            }
            
            formMessage.textContent = `❌ ${errorMsg}`;
            formMessage.className = 'form-message error';
        } finally {
            // Reset button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// ===== Console Easter Egg =====
console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #FF6B6B;');
console.log('%cThanks for checking out my portfolio. Feel free to reach out!', 'font-size: 14px; color: #737373;');
