document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Sticky Navbar & Active Link Update on Scroll ---
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');

    // Active Link based on URL
    const currentLocation = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });

    const orbs = document.querySelectorAll('.bg-orb');

    window.addEventListener('scroll', () => {
        // Sticky Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Parallax Orbs
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.15;
            const yPos = (window.scrollY * speed);
            orb.style.setProperty('--scroll-y', `${yPos}px`);
        });
    });

    // --- 2. Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const mobileIcon = mobileToggle.querySelector('i');

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        if (navMenu.classList.contains('active')) {
            mobileIcon.classList.remove('ri-menu-line');
            mobileIcon.classList.add('ri-close-line');
        } else {
            mobileIcon.classList.remove('ri-close-line');
            mobileIcon.classList.add('ri-menu-line');
        }
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileIcon.classList.remove('ri-close-line');
            mobileIcon.classList.add('ri-menu-line');
        });
    });

    // --- 3. Scroll Animations (Intersection Observer) ---
    const animatedElements = document.querySelectorAll('.fade-up, .fade-right, .fade-left');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible if you only want it to animate once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // --- 4. Contact Form Submission (Mock) ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            // Loading state
            btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Mengirim...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            // Simulate API call
            setTimeout(() => {
                alert('Terima kasih! Pesan Anda telah terkirim. Tim kami akan segera menghubungi Anda melalui WhatsApp.');
                contactForm.reset();
                
                // Reset button
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'all';
            }, 1500);
        });
    }

});
