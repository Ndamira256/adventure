/**
 * ADVENTURE - Interactive JavaScript Layer
 * Handles themes, slider auto-rotations, hotspots, custom modals, and scroll triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScrollHeader();
    initScrollProgress();
    initHeroSlider();
    initHeroBlueprint();
    initScrollytelling();
    initNatureSlider();
    initExploreMap();
    initModals();
    initScrollAnimations();
    initForms();
    initMobileNav();
});

/* ==========================================================================
   THEME SWITCHER (LIGHT / DARK)
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const body = document.body;

    // Check localStorage or system settings
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
    } else {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
    }

    // Toggle click event
    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        }
    });
}

/* ==========================================================================
   HEADER SCROLL EFFECTS
   ========================================================================== */
function initScrollHeader() {
    const header = document.querySelector('.main-header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Add scrolled class for styling/shrinking
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide header on scroll down, show on scroll up
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

/* ==========================================================================
   SCROLL PROGRESS BAR
   ========================================================================== */
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }, { passive: true });
}

/* ==========================================================================
   HERO SCROLL NAVIGATION (TABS & INDICATORS)
   ========================================================================== */
function initHeroSlider() {
    const tabs = document.querySelectorAll('.hero-tab');
    const indicators = document.querySelectorAll('.indicator-num');
    
    function scrollToSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Attach click events to bottom tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            scrollToSection(target);
        });
    });

    // Attach click events to left indicators
    indicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const target = ind.getAttribute('data-target');
            scrollToSection(target);
        });
    });

    // Scroll spy: Highlight indicators and tabs as user scrolls through sections
    const sections = ['hero', 'wonders', 'vacation', 'explore'];
    
    window.addEventListener('scroll', () => {
        let currentSection = 'hero';
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        sections.forEach(secId => {
            const el = document.getElementById(secId);
            if (el) {
                const top = el.offsetTop;
                if (scrollPosition >= top) {
                    currentSection = secId;
                }
            }
        });

        // Update indicators
        indicators.forEach(ind => {
            if (ind.getAttribute('data-target') === currentSection) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });

        // Update tabs
        tabs.forEach(tab => {
            if (tab.getAttribute('data-target') === currentSection) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }, { passive: true });
}

/* ==========================================================================
   HERO MOUSE TRACKING BLUEPRINT OVERLAY (CANVAS CUT-AND-HEAL SCRATCH REVEAL)
   ========================================================================== */
function initHeroBlueprint() {
    const hero = document.getElementById('hero');
    const canvas = document.getElementById('blueprintCanvas');
    if (!hero || !canvas) return;

    const ctx = canvas.getContext('2d');

    // Load blueprint image (onload attached before setting src to prevent race conditions)
    const blueprintImg = new Image();
    let imageLoaded = false;
    blueprintImg.onload = () => {
        imageLoaded = true;
    };
    blueprintImg.src = new URL('./assets/hero_blueprint.png', import.meta.url).href;
    if (blueprintImg.complete) {
        imageLoaded = true;
    }

    // Trail points list
    let trail = [];

    // Resize canvas to cover hero section
    function resizeCanvas() {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse coordinates
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Push new point with full life (1.0)
        trail.push({ x, y, age: 1.0 });

        // Cap trail points count to prevent memory issues
        if (trail.length > 150) {
            trail.shift();
        }
    });

    // Helper: Draws image like CSS 'background-size: cover'
    function drawImageCover(ctx, img, w, h) {
        const iw = img.width;
        const ih = img.height;
        const r = Math.min(w / iw, h / ih);
        let nw = iw * r;
        let nh = ih * r;
        let cx, cy, cw, ch, ar = 1;

        if (nw < w) ar = w / nw;
        if (Math.abs(nh - h) < 0.0001) ar = h / nh;

        nw *= ar;
        nh *= ar;

        cw = iw / (nw / w);
        ch = ih / (nh / h);

        cx = (iw - cw) * 0.5;
        cy = (ih - ch) * 0.5;

        ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
    }

    function tick() {
        requestAnimationFrame(tick);

        if (!imageLoaded) return;

        const w = canvas.width;
        const h = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        if (trail.length === 0) return;

        // Step 1: Draw the combined trail path (destination)
        ctx.globalCompositeOperation = 'source-over';

        if (trail.length === 1) {
            const pt = trail[0];
            const size = 12 * pt.age;
            ctx.beginPath();
            ctx.moveTo(pt.x - size * 0.8, pt.y - size * 0.4);
            ctx.lineTo(pt.x + size * 0.8, pt.y + size * 0.4);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.stroke();
        } else {
            ctx.beginPath();
            // Left edge of the slanted ribbon
            for (let i = 0; i < trail.length; i++) {
                const pt = trail[i];
                const size = 12 * pt.age; // Max width is 12px for a razor-sharp incision
                const sx = size * 0.8;
                const sy = size * 0.4;
                
                if (i === 0) {
                    ctx.moveTo(pt.x - sx, pt.y - sy);
                } else {
                    ctx.lineTo(pt.x - sx, pt.y - sy);
                }
            }
            // Right edge of the slanted ribbon
            for (let i = trail.length - 1; i >= 0; i--) {
                const pt = trail[i];
                const size = 12 * pt.age;
                const sx = size * 0.8;
                const sy = size * 0.4;
                
                ctx.lineTo(pt.x + sx, pt.y + sy);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.fill();
        }

        // Step 2: Draw the blueprint image clipped to the trail (source-in)
        ctx.globalCompositeOperation = 'source-in';
        drawImageCover(ctx, blueprintImg, w, h);

        // Step 3: Age points (healing)
        trail.forEach(pt => {
            pt.age -= 0.025; // Decrement age (heals in ~40 frames / 0.6 seconds)
        });

        // Clean up dead points
        trail = trail.filter(pt => pt.age > 0);
    }

    tick();
}

/* ==========================================================================
   SCROLLYTELLING MULTI-SECTION ENGINE
   ========================================================================== */
function initScrollytelling() {
    function tick() {
        const sections = ['hero', 'wonders', 'reasons', 'explore'];
        const viewHeight = window.innerHeight;

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const sectionHeight = el.offsetHeight;
            
            // Scroll ratio: 0 when top enters bottom of screen, 1 when bottom leaves top of screen
            let ratio = 0;
            if (rect.top <= viewHeight && rect.bottom >= 0) {
                const totalDist = sectionHeight + viewHeight;
                const currentDist = viewHeight - rect.top;
                ratio = Math.min(1, Math.max(0, currentDist / totalDist));
            } else if (rect.bottom < 0) {
                ratio = 1;
            }

            el.style.setProperty('--scroll-ratio', ratio);

            // Calculate zoom scale and opacity for storyline fly-through portal zoom
            let zoomScale = 1;
            let zoomOpacity = 1;

            if (ratio < 0.5) {
                // Entering: scale up from 0.45 to 1.0, opacity fade in
                const t = ratio / 0.5;
                zoomScale = 0.45 + t * 0.55;
                zoomOpacity = Math.pow(t, 1.5);
            } else {
                // Exiting: scale up from 1.0 to 3.2, opacity fade out
                const t = (ratio - 0.5) / 0.5;
                zoomScale = 1.0 + t * 2.2;
                zoomOpacity = 1 - Math.pow(t, 1.5);
            }

            el.style.setProperty('--zoom-scale', zoomScale);
            el.style.setProperty('--zoom-opacity', Math.max(0, Math.min(1, zoomOpacity)));
            
            // Pixels scrolled relative to hero viewport top (specifically for hero dolly zoom)
            if (id === 'hero') {
                el.style.setProperty('--scroll-y', `${Math.max(0, window.scrollY)}px`);
                const heroRatio = Math.min(1, Math.max(0, window.scrollY / sectionHeight));
                el.style.setProperty('--scroll-hero-ratio', heroRatio);
            }
        });
    }

    // Run on scroll and resize
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick(); // Initial call
}

/* ==========================================================================
   WONDERS OF NATURE CAROUSEL SLIDER
   ========================================================================== */
function initNatureSlider() {
    const track = document.getElementById('natureCardsTrack');
    const container = document.querySelector('.nature-cards-container');
    const prevBtn = document.getElementById('naturePrev');
    const nextBtn = document.getElementById('natureNext');

    if (!track || !prevBtn || !nextBtn) return;

    // Calculate scroll amount
    function getScrollAmount() {
        const card = track.querySelector('.nature-card');
        const gap = parseInt(window.getComputedStyle(track).gap) || 24;
        return card ? card.offsetWidth + gap : 300;
    }

    nextBtn.addEventListener('click', () => {
        container.scrollBy({
            left: getScrollAmount(),
            behavior: 'smooth'
        });
    });

    prevBtn.addEventListener('click', () => {
        container.scrollBy({
            left: -getScrollAmount(),
            behavior: 'smooth'
        });
    });

    // Touch support simple scroll snap checks
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5; // scroll speed multiplier
        container.scrollLeft = scrollLeft - walk;
    });
}

/* ==========================================================================
   INTERACTIVE EXPLORE MAP HOTSPOTS
   ========================================================================== */
function initExploreMap() {
    const hotspots = document.querySelectorAll('.map-hotspot');
    const callouts = document.querySelectorAll('.explore-callout');

    if (!hotspots.length || !callouts.length) return;

    function activatePoint(pointNum) {
        // Toggle Active Hotspots
        hotspots.forEach(hotspot => {
            if (hotspot.getAttribute('data-point') === pointNum) {
                hotspot.classList.add('active');
            } else {
                hotspot.classList.remove('active');
            }
        });

        // Toggle Active Callout Panels
        callouts.forEach(callout => {
            if (callout.getAttribute('data-point') === pointNum) {
                callout.classList.add('active');
            } else {
                callout.classList.remove('active');
            }
        });
    }

    // Hotspot interaction events
    hotspots.forEach(hotspot => {
        const pointNum = hotspot.getAttribute('data-point');
        
        hotspot.addEventListener('click', (e) => {
            e.stopPropagation();
            activatePoint(pointNum);
        });

        hotspot.addEventListener('mouseenter', () => {
            activatePoint(pointNum);
        });
    });

    // Left info callout interaction events
    callouts.forEach(callout => {
        const pointNum = callout.getAttribute('data-point');

        callout.addEventListener('click', () => {
            activatePoint(pointNum);
        });
        
        callout.addEventListener('mouseenter', () => {
            activatePoint(pointNum);
        });
    });
}

/* ==========================================================================
   MODALS HANDLING
   ========================================================================== */
function initModals() {
    const bookingModal = document.getElementById('bookingModal');
    const loginModal = document.getElementById('loginModal');
    
    const bookTriggers = document.querySelectorAll('.btn-book-trigger');
    const loginTriggers = document.querySelectorAll('.btn-login-trigger');

    const closeBooking = document.getElementById('closeBooking');
    const closeLogin = document.getElementById('closeLogin');

    const bookingBackdrop = bookingModal?.querySelector('.modal-backdrop');
    const loginBackdrop = loginModal?.querySelector('.modal-backdrop');

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scroll
    }

    // Booking trigger clicks
    bookTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(bookingModal);
        });
    });

    // Login trigger clicks
    loginTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    });

    // Close actions
    closeBooking?.addEventListener('click', () => closeModal(bookingModal));
    closeLogin?.addEventListener('click', () => closeModal(loginModal));
    
    bookingBackdrop?.addEventListener('click', () => closeModal(bookingModal));
    loginBackdrop?.addEventListener('click', () => closeModal(loginModal));

    // Keyboard ESC close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(bookingModal);
            closeModal(loginModal);
        }
    });
}

/* ==========================================================================
   SCROLL ENTRANCE REVEALS
   ========================================================================== */
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    if (!revealElements.length) return;

    const observerOptions = {
        root: null, // Viewport
        rootMargin: '0px',
        threshold: 0.12 // Trigger when 12% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: Stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   MOBILE NAV TOGGLE
   ========================================================================== */
function initMobileNav() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = mainNav?.querySelectorAll('a');

    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        
        // Prevent body scroll when menu open
        if (mainNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking a link
    navLinks?.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ==========================================================================
   FORM SUBMISSIONS & FLOATING NOTIFICATIONS
   ========================================================================== */
function initForms() {
    const bookingForm = document.getElementById('bookingForm');
    const loginForm = document.getElementById('loginForm');
    const newsletterForm = document.getElementById('newsletterForm');

    // Booking Submission
    bookingForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const clientName = document.getElementById('bookName').value;
        const selectedEscape = document.getElementById('bookDestination').options[document.getElementById('bookDestination').selectedIndex].text;
        
        // Close modal
        const bookingModal = document.getElementById('bookingModal');
        bookingModal.classList.remove('active');
        document.body.style.overflow = '';

        // Success Alert
        showNotification(
            'Expedition Proposed!',
            `Thanks ${clientName}! Our Wilderness coordinators will email you details for ${selectedEscape} soon.`,
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 20h18L12 4z"></path><path d="M12 4v16"></path><path d="M8 12h8"></path></svg>',
            6000
        );

        bookingForm.reset();
    });

    // Login Submission
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const clientEmail = document.getElementById('loginEmail').value;
        
        // Close modal
        const loginModal = document.getElementById('loginModal');
        loginModal.classList.remove('active');
        document.body.style.overflow = '';

        // Success notification
        showNotification(
            'Welcome to Basecamp',
            `Basecamp access authorized. Checked in as ${clientEmail}.`,
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m11.5 11.5 9-9"></path><path d="m17 6 3 3"></path><path d="m19 4 3 3"></path></svg>'
        );

        loginForm.reset();
    });

    // Newsletter Submission
    newsletterForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;

        showNotification(
            'Added to Trail Guide',
            `Trail bulletins will be sent to ${email}.`,
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
        );

        emailInput.value = '';
    });
}

/* ==========================================================================
   FLOATING NOTIFICATION SYSTEM
   ========================================================================== */
function showNotification(title, message, icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>', duration = 4000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    // Create element
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <div class="notification-text">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(notif);

    // Fade-in animation slide
    setTimeout(() => {
        notif.classList.add('active');
    }, 50);

    // Auto cleanup
    setTimeout(() => {
        notif.classList.remove('active');
        // Wait for fadeout animation transition then remove from DOM
        setTimeout(() => {
            notif.remove();
        }, 400);
    }, duration);
}
