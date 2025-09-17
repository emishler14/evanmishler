// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Update button text for accessibility
            const isOpen = navLinks.classList.contains('active');
            mobileMenuToggle.textContent = isOpen ? '✕' : '☰';
            mobileMenuToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile menu when clicking on a link
        const navLinkItems = navLinks.querySelectorAll('a');
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuToggle.textContent = '☰';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navLinks.contains(event.target) || mobileMenuToggle.contains(event.target);
            
            if (!isClickInsideNav && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle.textContent = '☰';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
});

// Portfolio Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioGrid = document.getElementById('portfolioGrid');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length > 0 && portfolioGrid && projectCards.length > 0) {
        
        // Add click event listeners to filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter projects with animation
                filterProjects(filterValue);
            });
        });

        function filterProjects(filterValue) {
            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const shouldShow = filterValue === 'all' || cardCategory === filterValue;
                
                if (shouldShow) {
                    // Show card with fade in effect
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    // Animate in
                    setTimeout(() => {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    // Hide card with fade out effect
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        }

        // Initialize with all projects visible
        filterProjects('all');
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Add scroll effect to header
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
});

// Add intersection observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards and sections for animation
    const animatedElements = document.querySelectorAll('.card, .project-card, .experience-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
});

// Form validation (if contact form is added later)
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add loading states for external links
document.addEventListener('DOMContentLoaded', function() {
    const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="https"]');
    
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Add loading state if needed
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 200);
        });
    });
});

// Lightbox functionality
function openLightbox(imageSrc, caption) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    
    lightboxImage.src = imageSrc;
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
    
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Clear the image after animation
    setTimeout(() => {
        if (!lightbox.classList.contains('show')) {
            document.getElementById('lightbox-image').src = '';
            document.getElementById('lightbox-caption').textContent = '';
        }
    }, 300);
}

// Close lightboxes with Escape key (image + video)
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Image lightbox (if present)
        if (typeof closeLightbox === 'function') {
            const imageLightbox = document.getElementById('lightbox');
            if (imageLightbox && imageLightbox.classList.contains('show')) {
                closeLightbox();
            }
        }
        // Video lightbox (if present)
        if (typeof closeVideoLightbox === 'function') {
            const videoLightbox = document.getElementById('videoLightbox');
            if (videoLightbox && videoLightbox.classList.contains('show')) {
                closeVideoLightbox();
            }
        }
        // Course lightbox removed
    }
});

// Prevent lightbox from closing when clicking on the image
document.addEventListener('DOMContentLoaded', function() {
    const lightboxContents = document.querySelectorAll('.lightbox-content');
    if (lightboxContents && lightboxContents.length) {
        lightboxContents.forEach(lb => lb.addEventListener('click', function(event) {
            event.stopPropagation();
        }));
    }
});

// Video lightbox functionality
function openVideoLightbox(youtubeIdOrUrl, title) {
    const videoLightbox = document.getElementById('videoLightbox');
    const iframe = document.getElementById('video-lightbox-iframe');
    const caption = document.getElementById('video-lightbox-caption');

    if (!videoLightbox || !iframe) return;

    const extractYouTubeId = (input) => {
        if (!input) return '';
        // If it's already an ID-like string
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
        // Try to parse common YouTube URL formats
        try {
            const url = new URL(input);
            if (url.hostname.includes('youtu.be')) {
                return url.pathname.replace('/', '').slice(0, 11);
            }
            if (url.hostname.includes('youtube.com')) {
                const v = url.searchParams.get('v');
                if (v) return v.slice(0, 11);
                // Handle /embed/VIDEO_ID
                const parts = url.pathname.split('/');
                const embedIndex = parts.indexOf('embed');
                if (embedIndex !== -1 && parts[embedIndex + 1]) {
                    return parts[embedIndex + 1].slice(0, 11);
                }
            }
        } catch (e) {
            // Not a URL; fall through
        }
        return '';
    };

    const videoId = extractYouTubeId(youtubeIdOrUrl);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';

    iframe.src = embedUrl;
    if (caption && title) caption.textContent = title;

    videoLightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeVideoLightbox() {
    const videoLightbox = document.getElementById('videoLightbox');
    const iframe = document.getElementById('video-lightbox-iframe');
    if (!videoLightbox || !iframe) return;

    videoLightbox.classList.remove('show');
    document.body.style.overflow = 'auto';

    // Clear the video to stop playback after animation
    setTimeout(() => {
        if (!videoLightbox.classList.contains('show')) {
            iframe.src = '';
            const caption = document.getElementById('video-lightbox-caption');
            if (caption) caption.textContent = '';
        }
    }, 300);
}

// Console log for developers
console.log('🎨 Evan Mishler Portfolio Website');
console.log('Built with vanilla HTML, CSS, and JavaScript');
console.log('Modern-retro design with responsive layout');
console.log('Contact: mishler.evan@gmail.com');

// Course lightbox functions removed (unused)
