/**
 * Celeste Culinary Group - Public Website Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Effect for Navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // Initial check in case page was refreshed while scrolled
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        }
    }

    // 2. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('ri-menu-line');
                icon.classList.toggle('ri-close-line');
            }
        });

        // Close mobile menu when clicking a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('ri-menu-line');
                    icon.classList.remove('ri-close-line');
                }
            });
        });
    }

    // 3. Dynamic Menu Loading & Tabs (For Landing & Services Pages)
    const menuContainer = document.getElementById('menu-dynamic-container');
    const tabButtons = document.querySelectorAll('.tab-btn');

    if (menuContainer && typeof window.CelesteDB !== 'undefined') {
        const loadAndFilterMenu = (category = 'all') => {
            const allItems = window.CelesteDB.getMenu();
            let filteredItems = allItems;
            
            if (category !== 'all') {
                filteredItems = allItems.filter(item => item.category === category);
            }

            // Limit elements to 6 if on the home page menu preview
            const isHomePage = menuContainer.getAttribute('data-limit') === '6';
            if (isHomePage) {
                filteredItems = filteredItems.slice(0, 6);
            }

            if (filteredItems.length === 0) {
                menuContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem;">No items found in this category.</div>`;
                return;
            }

            menuContainer.innerHTML = filteredItems.map(item => {
                const signatureTag = item.isSignature ? `<span class="menu-item-tag">Chef's Signature</span>` : '';
                return `
                    <div class="menu-item-card glass" style="border: 1px solid var(--border-light)">
                        <div class="menu-item-thumb">
                            <img src="${item.image || 'assets/images/restaurant_facade.png'}" alt="${item.name}" onerror="this.src='assets/images/restaurant_facade.png'">
                        </div>
                        <div class="menu-item-info">
                            ${signatureTag}
                            <div class="menu-item-head">
                                <h3 class="menu-item-name">${item.name}</h3>
                                <div class="menu-item-line"></div>
                                <span class="menu-item-price">$${Number(item.price).toFixed(2)}</span>
                            </div>
                            <p class="menu-item-desc">${item.description}</p>
                        </div>
                    </div>
                `;
            }).join('');
        };

        // Initialize Menu Load
        loadAndFilterMenu('all');

        // Setup Tab Toggles
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const cat = e.target.getAttribute('data-category');
                loadAndFilterMenu(cat);
            });
        });
    }

    // 4. Reservation Submission Handler
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm && typeof window.CelesteDB !== 'undefined') {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('res_name').value.trim();
            const email = document.getElementById('res_email').value.trim();
            const phone = document.getElementById('res_phone').value.trim();
            const date = document.getElementById('res_date').value;
            const time = document.getElementById('res_time').value;
            const guests = parseInt(document.getElementById('res_guests').value);
            const area = document.getElementById('res_area').value;
            const notes = document.getElementById('res_notes').value.trim() || 'N/A';

            // Custom Simple Validations
            if (!name || !email || !phone || !date || !time || !guests) {
                showToast('Please fill out all required fields.', true);
                return;
            }

            const reservationData = {
                name,
                email,
                phone,
                date,
                time,
                guests,
                area,
                notes,
                status: 'Pending'
            };

            window.CelesteDB.saveReservation(reservationData);
            showToast('Reservation requested! We will contact you soon.', false);
            
            reservationForm.reset();
        });
    }

    // 5. Contact / Inquiry Submission Handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm && typeof window.CelesteDB !== 'undefined') {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const subject = document.getElementById('subject') ? document.getElementById('subject').value.trim() : 'General Inquiry';
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !phone || !message) {
                showToast('Please fill out all required fields.', true);
                return;
            }

            const msgData = {
                name,
                email,
                phone,
                subject,
                message
            };

            window.CelesteDB.saveMessage(msgData);
            showToast('Message sent! Our concierge will reply shortly.', false);

            contactForm.reset();
        });
    }

    // 6. Toast Notification Helper
    const showToast = (message, isError = false) => {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'toast-msg';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.borderLeftColor = isError ? '#e74c3c' : '#D4AF37';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    };
});
