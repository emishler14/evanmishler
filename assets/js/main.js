/**
 * Evan Mishler Portfolio
 * Main JavaScript
 */

(function() {
    'use strict';

    // ============================================
    // Mobile Navigation
    // ============================================

    function initMobileNav() {
        const toggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.querySelector('.nav-links');

        if (!toggle || !navLinks) return;

        // Set initial hamburger icon
        toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';

        toggle.addEventListener('click', function() {
            const isOpen = navLinks.classList.toggle('active');

            // Update icon
            if (isOpen) {
                toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            } else {
                toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
            }

            toggle.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !toggle.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ============================================
    // Header Scroll Behavior
    // ============================================

    function initHeaderScroll() {
        const header = document.querySelector('header');
        if (!header) return;

        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const currentScroll = window.pageYOffset;

                    if (currentScroll > lastScroll && currentScroll > 100) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }

                    lastScroll = currentScroll;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // Fade-In Animations
    // ============================================

    function initFadeAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in');
        if (!fadeElements.length) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        fadeElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // Portfolio Filter
    // ============================================

    function initPortfolioFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const grid = document.getElementById('portfolioGrid');
        const cards = document.querySelectorAll('.project-card');

        if (!filterBtns.length || !grid || !cards.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;

                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Filter cards
                cards.forEach(card => {
                    const category = card.dataset.category;
                    const shouldShow = filter === 'all' || category === filter;

                    if (shouldShow) {
                        card.style.display = '';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';

                        requestAnimationFrame(() => {
                            card.style.transition = 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        });
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href').slice(1);
                if (!targetId) return;

                const target = document.getElementById(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPos = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPos,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // Lightbox Functions
    // ============================================

    window.openLightbox = function(imageSrc, caption) {
        const lightbox = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-image');
        const cap = document.getElementById('lightbox-caption');

        if (!lightbox || !img) return;

        img.src = imageSrc;
        img.alt = caption || '';
        if (cap) cap.textContent = caption || '';

        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        lightbox.classList.remove('show');
        document.body.style.overflow = '';

        setTimeout(() => {
            const img = document.getElementById('lightbox-image');
            const cap = document.getElementById('lightbox-caption');
            if (img) img.src = '';
            if (cap) cap.textContent = '';
        }, 300);
    };

    // ============================================
    // Video Lightbox Functions
    // ============================================

    function extractYouTubeId(input) {
        if (!input) return '';

        // Already an ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

        try {
            const url = new URL(input);

            if (url.hostname.includes('youtu.be')) {
                return url.pathname.slice(1, 12);
            }

            if (url.hostname.includes('youtube.com')) {
                const v = url.searchParams.get('v');
                if (v) return v.slice(0, 11);

                const parts = url.pathname.split('/');
                const embedIdx = parts.indexOf('embed');
                if (embedIdx !== -1 && parts[embedIdx + 1]) {
                    return parts[embedIdx + 1].slice(0, 11);
                }
            }
        } catch (e) {
            // Not a URL
        }

        return '';
    }

    window.openVideoLightbox = function(youtubeIdOrUrl, title) {
        const lightbox = document.getElementById('videoLightbox');
        const iframe = document.getElementById('video-lightbox-iframe');
        const caption = document.getElementById('video-lightbox-caption');

        if (!lightbox || !iframe) return;

        const videoId = extractYouTubeId(youtubeIdOrUrl);
        const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';

        iframe.src = embedUrl;
        if (caption && title) caption.textContent = title;

        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    window.closeVideoLightbox = function() {
        const lightbox = document.getElementById('videoLightbox');
        const iframe = document.getElementById('video-lightbox-iframe');

        if (!lightbox) return;

        lightbox.classList.remove('show');
        document.body.style.overflow = '';

        setTimeout(() => {
            if (iframe) iframe.src = '';
            const caption = document.getElementById('video-lightbox-caption');
            if (caption) caption.textContent = '';
        }, 300);
    };

    // Close lightboxes with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const imageLightbox = document.getElementById('lightbox');
            const videoLightbox = document.getElementById('videoLightbox');

            if (imageLightbox?.classList.contains('show')) {
                closeLightbox();
            }
            if (videoLightbox?.classList.contains('show')) {
                closeVideoLightbox();
            }
        }
    });

    // Prevent lightbox close when clicking content
    document.querySelectorAll('.lightbox-content').forEach(content => {
        content.addEventListener('click', e => e.stopPropagation());
    });

    // ============================================
    // Initialize
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
        initMobileNav();
        initHeaderScroll();
        initFadeAnimations();
        initPortfolioFilter();
        initSmoothScroll();
    });

})();
