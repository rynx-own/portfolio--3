// ============================================
// NAVIGATION SCROLL EFFECT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.padding = '0.8rem 0';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '1.2rem 0';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
        
        updateActiveNavLink();
    });
});

// ============================================
// ACTIVE NAV LINK ON SCROLL
// ============================================
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                if (navbarToggler) navbarToggler.click();
            }
            
            // Smooth scroll to target
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// LOGO SLIDER WITH DRAG-TO-COLOR FEATURE
// ============================================
class LogoSlider {
    constructor() {
        this.track = document.getElementById('logoTrack');
        this.container = document.querySelector('.logo-slider-container');
        this.logos = [
            { name: 'JavaScript', icon: 'fab fa-js-square', color: 'js-color' },
            { name: 'HTML5', icon: 'fab fa-html5', color: 'html-color' },
            { name: 'CSS3', icon: 'fab fa-css3-alt', color: 'css-color' },
            { name: 'Node.js', icon: 'fab fa-node-js', color: 'node-color' },
            { name: 'Python', icon: 'fab fa-python', color: 'python-color' },
            { name: 'React', icon: 'fab fa-react', color: 'react-color' },
            { name: 'PHP', icon: 'fab fa-php', color: 'php-color' },
            { name: 'Git', icon: 'fab fa-git-alt', color: 'git-color' }
        ];
        
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.currentIndex = 0;
        this.logoWidth = 190; // 150px + 40px gap
        this.velocity = 0;
        this.lastX = 0;
        this.timestamp = 0;
        this.autoSlideInterval = null;
        
        this.init();
    }
    
    init() {
        this.createLogos();
        this.setupEventListeners();
        this.startAutoSlide();
        this.animate();
    }
    
    createLogos() {
        this.track.innerHTML = '';
        
        // Create multiple sets for infinite scroll
        const totalSets = 3;
        for (let set = 0; set < totalSets; set++) {
            this.logos.forEach((logo, index) => {
                const logoItem = document.createElement('div');
                logoItem.className = 'logo-item';
                logoItem.dataset.index = (set * this.logos.length + index);
                logoItem.innerHTML = `
                    <i class="${logo.icon} ${logo.color}"></i>
                    <span>${logo.name}</span>
                `;
                
                // Add event listeners for color effect
                logoItem.addEventListener('mouseenter', () => {
                    if (this.isDragging) {
                        this.colorizeLogo(logoItem);
                    }
                });
                
                logoItem.addEventListener('touchstart', (e) => {
                    if (this.isDragging) {
                        this.colorizeLogo(logoItem);
                        e.preventDefault();
                    }
                });
                
                this.track.appendChild(logoItem);
            });
        }
    }
    
    setupEventListeners() {
        // Mouse events
        this.container.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // Touch events
        this.container.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false });
        document.addEventListener('touchmove', (e) => this.drag(e.touches[0]), { passive: false });
        document.addEventListener('touchend', () => this.endDrag());
        
        // Prevent context menu on drag
        this.container.addEventListener('contextmenu', (e) => {
            if (this.isDragging) e.preventDefault();
        });
        
        // Button controls
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.slide(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.slide(1));
        
        // Pause auto-slide on hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoSlide());
        this.container.addEventListener('mouseleave', () => this.resumeAutoSlide());
        
        // Prevent image drag
        this.container.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.startX = e.pageX - this.container.offsetLeft;
        this.scrollLeft = this.track.scrollLeft;
        this.velocity = 0;
        this.lastX = e.pageX;
        this.timestamp = Date.now();
        
        this.container.style.cursor = 'grabbing';
        this.container.style.userSelect = 'none';
        
        this.pauseAutoSlide();
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        const x = e.pageX - this.container.offsetLeft;
        const walk = (x - this.startX) * 1.5;
        
        // Apply rubber band effect
        const maxScroll = this.track.scrollWidth - this.container.clientWidth;
        let newScroll = this.scrollLeft - walk;
        
        // Rubber band effect at boundaries
        if (newScroll < 0) {
            newScroll = newScroll * 0.3;
        } else if (newScroll > maxScroll) {
            newScroll = maxScroll + (newScroll - maxScroll) * 0.3;
        }
        
        this.track.scrollLeft = newScroll;
        
        // Calculate velocity for momentum scrolling
        const now = Date.now();
        const deltaTime = now - this.timestamp;
        const deltaX = e.pageX - this.lastX;
        
        if (deltaTime > 0) {
            this.velocity = deltaX / deltaTime;
        }
        
        this.lastX = e.pageX;
        this.timestamp = now;
        
        // Colorize logos during drag
        this.colorizeLogosInView();
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.container.style.cursor = 'grab';
        this.container.style.userSelect = 'auto';
        
        // Apply momentum
        this.applyMomentum();
        
        // Snap to nearest logo
        setTimeout(() => this.snapToNearestLogo(), 100);
        
        // Resume auto slide after a delay
        setTimeout(() => this.resumeAutoSlide(), 3000);
    }
    
    applyMomentum() {
        const momentum = this.velocity * 15;
        let targetScroll = this.track.scrollLeft + momentum;
        const maxScroll = this.track.scrollWidth - this.container.clientWidth;
        
        // Clamp to boundaries
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        // Animate momentum
        const startScroll = this.track.scrollLeft;
        const distance = targetScroll - startScroll;
        const duration = Math.min(Math.abs(distance) / 5, 1000);
        
        let startTime = null;
        
        const animateMomentum = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.track.scrollLeft = startScroll + distance * easeOut;
            
            if (progress < 1) {
                requestAnimationFrame(animateMomentum);
            } else {
                this.snapToNearestLogo();
            }
        };
        
        requestAnimationFrame(animateMomentum);
    }
    
    snapToNearestLogo() {
        const scrollPos = this.track.scrollLeft;
        const logoIndex = Math.round(scrollPos / this.logoWidth);
        const targetScroll = logoIndex * this.logoWidth;
        
        this.track.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
        
        this.currentIndex = logoIndex % this.logos.length;
        this.colorizeLogosInView();
    }
    
    colorizeLogosInView() {
        const containerRect = this.container.getBoundingClientRect();
        const logos = this.track.querySelectorAll('.logo-item');
        
        // Reset all logos
        logos.forEach(logo => {
            logo.classList.remove('active');
            const icon = logo.querySelector('i');
            icon.style.filter = 'grayscale(100%)';
            icon.style.opacity = '0.7';
        });
        
        // Colorize logos in viewport
        logos.forEach(logo => {
            const logoRect = logo.getBoundingClientRect();
            
            // Check if logo is in the middle 60% of container
            const isInMiddle = logoRect.left >= containerRect.left + (containerRect.width * 0.2) &&
                              logoRect.right <= containerRect.right - (containerRect.width * 0.2);
            
            if (isInMiddle) {
                this.colorizeLogo(logo);
            }
        });
    }
    
    colorizeLogo(logoElement) {
        logoElement.classList.add('active');
        const icon = logoElement.querySelector('i');
        
        // Add pop animation
        icon.style.animation = 'none';
        void icon.offsetWidth; // Trigger reflow
        icon.style.animation = 'colorPop 0.5s ease forwards';
        
        // Remove animation after it completes
        setTimeout(() => {
            icon.style.animation = '';
        }, 500);
    }
    
    slide(direction) {
        this.pauseAutoSlide();
        
        const maxIndex = Math.floor(this.track.scrollWidth / this.logoWidth) - 1;
        this.currentIndex = Math.max(0, Math.min(this.currentIndex + direction, maxIndex));
        
        const targetScroll = this.currentIndex * this.logoWidth;
        
        this.track.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
        
        this.colorizeLogosInView();
        
        // Resume auto slide after delay
        setTimeout(() => this.resumeAutoSlide(), 5000);
    }
    
    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            if (!this.isDragging) {
                this.slide(1);
            }
        }, 5000);
    }
    
    pauseAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    resumeAutoSlide() {
        if (!this.autoSlideInterval && !this.isDragging) {
            this.startAutoSlide();
        }
    }
    
    animate() {
        // Infinite scroll loop
        const checkInfiniteScroll = () => {
            const maxScroll = this.track.scrollWidth - this.container.clientWidth;
            const currentScroll = this.track.scrollLeft;
            
            // If near the end, jump to middle
            if (currentScroll >= maxScroll - this.logoWidth) {
                this.track.scrollLeft = this.logoWidth * this.logos.length;
            }
            // If near the beginning, jump to middle from other side
            else if (currentScroll <= this.logoWidth) {
                this.track.scrollLeft = maxScroll - (this.logoWidth * this.logos.length * 2);
            }
        };
        
        const animationLoop = () => {
            if (!this.isDragging) {
                checkInfiniteScroll();
                this.colorizeLogosInView();
            }
            requestAnimationFrame(animationLoop);
        };
        
        animationLoop();
    }
}

// ============================================
// SCROLL ANIMATIONS FOR SECTIONS
// ============================================
function setupScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate project cards
                if (entry.target.id === 'projects') {
                    const cards = entry.target.querySelectorAll('.project-card');
                    cards.forEach((card, index) => {
                        card.style.animationDelay = `${index * 0.2}s`;
                        card.style.animation = 'slideIn 0.6s ease forwards';
                    });
                }
                
                // Animate work cards
                if (entry.target.id === 'work') {
                    const cards = entry.target.querySelectorAll('.work-card');
                    cards.forEach((card, index) => {
                        card.style.animationDelay = `${index * 0.15}s`;
                        card.style.animation = 'slideIn 0.5s ease forwards';
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ============================================
// PROFILE IMAGE HOVER EFFECT
// ============================================
function setupProfileImage() {
    const profileImg = document.querySelector('.profile-img');
    
    if (profileImg) {
        profileImg.addEventListener('mouseenter', () => {
            profileImg.style.transform = 'scale(1.05) rotate(5deg)';
        });
        
        profileImg.addEventListener('mouseleave', () => {
            profileImg.style.transform = 'scale(1) rotate(0deg)';
        });
    }
}

// ============================================
// PROJECT CARD INTERACTIONS
// ============================================
function setupProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const image = card.querySelector('.project-image img');
            if (image) {
                image.style.transform = 'scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const image = card.querySelector('.project-image img');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
    });
}

// ============================================
// SOCIAL MEDIA LINK CONFIRMATION
// ============================================
function setupSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link[href^="http"]');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const platform = link.querySelector('i').className.split(' ')[1].replace('fa-', '');
            const confirmLeave = confirm(`You are being redirected to ${platform}. Continue?`);
            
            if (!confirmLeave) {
                e.preventDefault();
            }
        });
    });
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize logo slider
    const logoSlider = new LogoSlider();
    
    // Setup other features
    setupProfileImage();
    setupScrollAnimations();
    setupProjectCards();
    setupSocialLinks();
    updateActiveNavLink();
    
    console.log('Portfolio initialized successfully! 🚀');
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================
// WINDOW RESIZE HANDLER
// ============================================
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateActiveNavLink();
    }, 250);
});
