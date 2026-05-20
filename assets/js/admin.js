/**
 * Celeste Culinary Group - Admin Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if CelesteDB is loaded
    if (typeof window.CelesteDB === 'undefined') {
        console.error('CelesteDB database module is missing.');
        return;
    }

    const DB = window.CelesteDB;

    // --- DOM Elements ---
    const navItems = document.querySelectorAll('.admin-nav-item');
    const panels = document.querySelectorAll('.admin-panel');
    const pageTitle = document.getElementById('admin-page-title');

    // KPI Counters
    const kpiRevenue = document.getElementById('kpi-revenue');
    const kpiBookings = document.getElementById('kpi-bookings');
    const kpiMessages = document.getElementById('kpi-messages');
    const kpiCapacity = document.getElementById('kpi-capacity');
    const unreadInboxBadge = document.getElementById('unread-inbox-badge');

    // Modals
    const modalRes = document.getElementById('modal-reservation');
    const modalMenu = document.getElementById('modal-menu');
    const modalReply = document.getElementById('modal-reply');

    // Forms
    const formRes = document.getElementById('modalReservationForm');
    const formMenu = document.getElementById('modalMenuForm');
    const formReply = document.getElementById('modalReplyForm');
    const formSettings = document.getElementById('settingsForm');

    // --- Global View State ---
    let currentResFilter = 'all';
    let currentResSearch = '';

    // ================= 1. TAB SYSTEM NAVIGATION =================
    window.switchPanel = (panelName) => {
        // Toggle Nav Items
        navItems.forEach(item => {
            if (item.getAttribute('data-panel') === panelName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Toggle Panels
        panels.forEach(panel => {
            if (panel.id === `panel-${panelName}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Update Title Text
        const titles = {
            overview: 'Overview Ringkasan',
            reservations: 'Pemesanan Meja',
            menu: 'Manajer Menu Dapur',
            inbox: 'Pesan Masuk Concierge',
            settings: 'Pengaturan Restoran'
        };
        pageTitle.textContent = titles[panelName] || 'Dashboard';
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const panel = item.getAttribute('data-panel');
            switchPanel(panel);
        });
    });

    // ================= 2. DATA RENDERING & COMPUTATION =================
    
    // Updates KPIs on overview panel
    const updateOverviewKPIs = () => {
        const reservations = DB.getReservations();
        const messages = DB.getMessages();
        const settings = DB.getSettings();

        // 1. Calculate Estimated Revenue: $55 per guest for Approved or Completed bookings
        const revenue = reservations
            .filter(r => r.status === 'Approved' || r.status === 'Completed')
            .reduce((acc, r) => acc + (r.guests * 55), 0);
        kpiRevenue.textContent = `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // 2. Active Bookings count (Pending + Approved)
        const activeBookings = reservations.filter(r => r.status === 'Pending' || r.status === 'Approved').length;
        kpiBookings.textContent = activeBookings;

        // 3. Unread Messages count
        const unreadCount = messages.filter(m => !m.isRead).length;
        kpiMessages.textContent = unreadCount;
        if (unreadCount > 0) {
            unreadInboxBadge.textContent = unreadCount;
            unreadInboxBadge.style.display = 'inline-block';
        } else {
            unreadInboxBadge.style.display = 'none';
        }

        // 4. Capacity occupancy percentage: approved guest total / maxCapacity
        const totalGuestsToday = reservations
            .filter(r => r.status === 'Approved')
            .reduce((acc, r) => acc + r.guests, 0);
        const capacityPercentage = Math.min(Math.round((totalGuestsToday / settings.maxCapacity) * 100), 100);
        kpiCapacity.textContent = `${capacityPercentage}%`;
    };

    // Render Recent Reservations on Overview panel
    const renderRecentReservations = () => {
        const tbody = document.getElementById('recent-bookings-tbody');
        if (!tbody) return;

        const reservations = DB.getReservations();
        // Sort descending by created date
        const sorted = [...reservations].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 4);

        if (sorted.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Belum ada data reservasi.</td></tr>`;
            return;
        }

        tbody.innerHTML = sorted.map(r => {
            const statusClass = r.status.toLowerCase();
            return `
                <tr>
                    <td style="font-weight: 500;">${escapeHTML(r.name)}</td>
                    <td>${r.date} &nbsp;<span style="color: var(--accent-gold);">${r.time}</span></td>
                    <td>${r.guests} Orang</td>
                    <td style="text-transform: capitalize;">${r.area.replace('-', ' ')}</td>
                    <td><span class="status-badge badge-${statusClass}">${r.status}</span></td>
                </tr>
            `;
        }).join('');
    };

    // Render full Reservations Table panel
    const renderReservationsTable = () => {
        const tbody = document.getElementById('reservations-table-tbody');
        if (!tbody) return;

        const reservations = DB.getReservations();
        
        // Filter & Search logic
        let filtered = reservations;
        if (currentResFilter !== 'all') {
            filtered = filtered.filter(r => r.status.toLowerCase() === currentResFilter);
        }
        if (currentResSearch) {
            const searchVal = currentResSearch.toLowerCase();
            filtered = filtered.filter(r => 
                r.name.toLowerCase().includes(searchVal) || 
                r.phone.includes(searchVal) ||
                r.email.toLowerCase().includes(searchVal)
            );
        }

        // Sort descending by created date
        filtered.sort((a, b) => new Date(b.created) - new Date(a.created));

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">Data reservasi tidak ditemukan.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(r => {
            const statusClass = r.status.toLowerCase();
            return `
                <tr>
                    <td>
                        <div style="font-weight: 500; color: #FFF;">${escapeHTML(r.name)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(r.phone)} | ${escapeHTML(r.email)}</div>
                    </td>
                    <td>${r.date} <span style="color: var(--accent-gold); font-size: 0.85rem;">${r.time}</span></td>
                    <td>${r.guests} Kursi</td>
                    <td style="text-transform: capitalize;">${r.area.replace('-', ' ')}</td>
                    <td style="font-size: 0.85rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(r.notes)}">${escapeHTML(r.notes)}</td>
                    <td><span class="status-badge badge-${statusClass}">${r.status}</span></td>
                    <td>
                        <div class="action-group" style="justify-content: flex-end;">
                            ${r.status === 'Pending' ? `
                                <button class="action-btn btn-approve" onclick="updateResStatus('${r.id}', 'Approved')" title="Setujui"><i class="ri-check-line"></i></button>
                                <button class="action-btn btn-cancel" onclick="updateResStatus('${r.id}', 'Cancelled')" title="Batalkan"><i class="ri-close-line"></i></button>
                            ` : ''}
                            ${r.status === 'Approved' ? `
                                <button class="action-btn btn-approve" style="border-color: #3498db; color: #3498db;" onclick="updateResStatus('${r.id}', 'Completed')" title="Selesaikan"><i class="ri-checkbox-circle-line"></i></button>
                            ` : ''}
                            <button class="action-btn btn-edit" onclick="openEditReservationModal('${r.id}')" title="Edit"><i class="ri-edit-line"></i></button>
                            <button class="action-btn btn-delete" onclick="deleteReservationItem('${r.id}')" title="Hapus"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    // Render Menu Items Table panel
    const renderMenuTable = () => {
        const tbody = document.getElementById('menu-table-tbody');
        if (!tbody) return;

        const menu = DB.getMenu();

        if (menu.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">Menu makanan kosong. Silakan tambah menu baru.</td></tr>`;
            return;
        }

        tbody.innerHTML = menu.map(item => {
            const signatureBadge = item.isSignature ? '<span class="status-badge badge-approved">Yes</span>' : '<span class="status-badge badge-read">No</span>';
            return `
                <tr>
                    <td>
                        <img src="${item.image || 'assets/images/restaurant_facade.png'}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-light);" onerror="this.src='assets/images/restaurant_facade.png'">
                    </td>
                    <td style="font-weight: 500; color: #FFF;">${escapeHTML(item.name)}</td>
                    <td style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">${item.category}</td>
                    <td style="font-weight: 600; color: var(--accent-gold);">$${Number(item.price).toFixed(2)}</td>
                    <td>${signatureBadge}</td>
                    <td style="font-size: 0.85rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(item.description)}">${escapeHTML(item.description)}</td>
                    <td>
                        <div class="action-group" style="justify-content: flex-end;">
                            <button class="action-btn btn-edit" onclick="openEditMenuModal('${item.id}')" title="Edit"><i class="ri-edit-line"></i></button>
                            <button class="action-btn btn-delete" onclick="deleteMenuItem('${item.id}')" title="Hapus"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    // Render Inbox Inquiries panel
    const renderInboxTable = () => {
        const tbody = document.getElementById('inbox-table-tbody');
        if (!tbody) return;

        const messages = DB.getMessages();
        // Sort descending by date
        const sorted = [...messages].sort((a, b) => new Date(b.created) - new Date(a.created));

        if (sorted.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">Kotak masuk kosong.</td></tr>`;
            return;
        }

        tbody.innerHTML = sorted.map(msg => {
            const statusClass = msg.isRead ? 'read' : 'unread';
            const statusLabel = msg.isRead ? 'Dibaca' : 'Baru';
            return `
                <tr>
                    <td>
                        <div style="font-weight: 500; color: #FFF;">${escapeHTML(msg.name)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(msg.phone)} | ${escapeHTML(msg.email)}</div>
                    </td>
                    <td style="font-weight: 500;">${escapeHTML(msg.subject)}</td>
                    <td style="font-size: 0.85rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(msg.message)}">${escapeHTML(msg.message)}</td>
                    <td>${new Date(msg.created).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span class="status-badge badge-${statusClass}">${statusLabel}</span></td>
                    <td>
                        <div class="action-group" style="justify-content: flex-end;">
                            ${!msg.isRead ? `
                                <button class="action-btn btn-approve" onclick="markMessageAsRead('${msg.id}')" title="Tandai Dibaca"><i class="ri-mail-open-line"></i></button>
                            ` : ''}
                            <button class="action-btn btn-edit" style="color: var(--accent-gold); border-color: var(--border-color);" onclick="openReplyModal('${msg.id}')" title="Kirim Balasan"><i class="ri-reply-line"></i></button>
                            <button class="action-btn btn-delete" onclick="deleteMessageItem('${msg.id}')" title="Hapus"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    // Render configuration settings form
    const renderSettingsForm = () => {
        const settings = DB.getSettings();
        document.getElementById('set_name').value = settings.restaurantName;
        document.getElementById('set_capacity').value = settings.maxCapacity;
        document.getElementById('set_area').value = settings.defaultArea;
        document.getElementById('set_hours').value = settings.openingHours;
        document.getElementById('set_email').value = settings.emailContact;
        document.getElementById('set_phone').value = settings.phoneContact;
        document.getElementById('set_alert').value = settings.alertNotice || '';
    };

    // Master function to refresh all layouts
    const refreshAllDashboardViews = () => {
        updateOverviewKPIs();
        renderRecentReservations();
        renderReservationsTable();
        renderMenuTable();
        renderInboxTable();
    };

    // ================= 3. RESERVATIONS CRUD IMPLEMENTATION =================

    // Action: Approve/Cancel Status
    window.updateResStatus = (id, newStatus) => {
        const res = DB.getReservations().find(r => r.id === id);
        if (res) {
            res.status = newStatus;
            DB.saveReservation(res);
            showToast(`Reservasi ${res.name} berhasil diubah ke: ${newStatus}`);
            refreshAllDashboardViews();
        }
    };

    // Action: Delete Item
    window.deleteReservationItem = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus reservasi ini secara permanen?')) {
            DB.deleteReservation(id);
            showToast('Reservasi berhasil dihapus.');
            refreshAllDashboardViews();
        }
    };

    // Action: Edit Click (Opens modal and populates fields)
    window.openEditReservationModal = (id) => {
        const res = DB.getReservations().find(r => r.id === id);
        if (!res) return;

        document.getElementById('res-modal-title').textContent = 'Ubah Detail Reservasi';
        document.getElementById('modal_res_id').value = res.id;
        document.getElementById('modal_res_name').value = res.name;
        document.getElementById('modal_res_email').value = res.email;
        document.getElementById('modal_res_phone').value = res.phone;
        document.getElementById('modal_res_date').value = res.date;
        document.getElementById('modal_res_time').value = res.time;
        document.getElementById('modal_res_guests').value = res.guests;
        document.getElementById('modal_res_area').value = res.area;
        document.getElementById('modal_res_status').value = res.status;
        document.getElementById('modal_res_notes').value = res.notes || '';

        modalRes.classList.add('active');
    };

    // Form Submit: Add/Edit Reservation Modal
    formRes.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('modal_res_id').value;
        const name = document.getElementById('modal_res_name').value.trim();
        const email = document.getElementById('modal_res_email').value.trim();
        const phone = document.getElementById('modal_res_phone').value.trim();
        const date = document.getElementById('modal_res_date').value;
        const time = document.getElementById('modal_res_time').value;
        const guests = parseInt(document.getElementById('modal_res_guests').value);
        const area = document.getElementById('modal_res_area').value;
        const status = document.getElementById('modal_res_status').value;
        const notes = document.getElementById('modal_res_notes').value.trim() || 'N/A';

        const reservationData = {
            name, email, phone, date, time, guests, area, status, notes
        };

        if (id) {
            reservationData.id = id;
            showToast('Reservasi berhasil diperbarui.');
        } else {
            showToast('Reservasi manual berhasil ditambahkan.');
        }

        DB.saveReservation(reservationData);
        modalRes.classList.remove('active');
        formRes.reset();
        refreshAllDashboardViews();
    });

    // Button: Open Empty Reservation Modal (Add manual)
    document.getElementById('btn-add-reservation').addEventListener('click', () => {
        document.getElementById('res-modal-title').textContent = 'Pemesanan Meja Baru';
        document.getElementById('modal_res_id').value = '';
        formRes.reset();
        // pre-fill status
        document.getElementById('modal_res_status').value = 'Approved';
        modalRes.classList.add('active');
    });

    // Close buttons
    document.getElementById('btn-close-res-modal').addEventListener('click', () => {
        modalRes.classList.remove('active');
    });

    // Setup Search & Reservation Filters listeners
    const searchResInput = document.getElementById('search-reservations');
    searchResInput.addEventListener('input', (e) => {
        currentResSearch = e.target.value.trim();
        renderReservationsTable();
    });

    const resFilterButtons = document.querySelectorAll('[data-res-filter]');
    resFilterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            resFilterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentResFilter = e.target.getAttribute('data-res-filter');
            renderReservationsTable();
        });
    });

    // ================= 4. MENU ITEMS CRUD IMPLEMENTATION =================

    // Action: Delete Menu Item
    window.deleteMenuItem = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus hidangan ini dari menu utama?')) {
            DB.deleteMenuItem(id);
            showToast('Hidangan menu berhasil dihapus.');
            refreshAllDashboardViews();
        }
    };

    // Action: Open Edit Menu Modal
    window.openEditMenuModal = (id) => {
        const item = DB.getMenu().find(m => m.id === id);
        if (!item) return;

        document.getElementById('menu-modal-title').textContent = 'Ubah Detail Hidangan';
        document.getElementById('modal_menu_id').value = item.id;
        document.getElementById('modal_menu_name').value = item.name;
        document.getElementById('modal_menu_price').value = item.price;
        document.getElementById('modal_menu_category').value = item.category;
        document.getElementById('modal_menu_image').value = item.image;
        document.getElementById('modal_menu_signature').checked = item.isSignature;
        document.getElementById('modal_menu_desc').value = item.description;

        modalMenu.classList.add('active');
    };

    // Form Submit: Add/Edit Menu Form
    formMenu.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('modal_menu_id').value;
        const name = document.getElementById('modal_menu_name').value.trim();
        const price = parseFloat(document.getElementById('modal_menu_price').value);
        const category = document.getElementById('modal_menu_category').value;
        const image = document.getElementById('modal_menu_image').value;
        const isSignature = document.getElementById('modal_menu_signature').checked;
        const description = document.getElementById('modal_menu_desc').value.trim();

        const menuData = {
            name, price, category, image, isSignature, description
        };

        if (id) {
            menuData.id = id;
            showToast('Hidangan menu berhasil diperbarui.');
        } else {
            showToast('Hidangan menu baru berhasil ditambahkan.');
        }

        DB.saveMenuItem(menuData);
        modalMenu.classList.remove('active');
        formMenu.reset();
        refreshAllDashboardViews();
    });

    // Button: Open Empty Menu Modal (Add item)
    document.getElementById('btn-add-menu').addEventListener('click', () => {
        document.getElementById('menu-modal-title').textContent = 'Tambah Hidangan Baru';
        document.getElementById('modal_menu_id').value = '';
        formMenu.reset();
        modalMenu.classList.add('active');
    });

    document.getElementById('btn-close-menu-modal').addEventListener('click', () => {
        modalMenu.classList.remove('active');
    });

    // ================= 5. INBOX INQUIRIES IMPLEMENTATION =================

    // Action: Mark inquiry as read
    window.markMessageAsRead = (id) => {
        const messages = DB.getMessages();
        const index = messages.findIndex(m => m.id === id);
        if (index !== -1) {
            messages[index].isRead = true;
            DB.saveMessage(messages[index]);
            showToast('Pesan ditandai sebagai sudah dibaca.');
            refreshAllDashboardViews();
        }
    };

    // Action: Delete inquiry
    window.deleteMessageItem = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus pesan inquiry ini secara permanen?')) {
            DB.deleteMessage(id);
            showToast('Pesan berhasil dihapus.');
            refreshAllDashboardViews();
        }
    };

    // Action: Open Reply Modal
    window.openReplyModal = (id) => {
        const msg = DB.getMessages().find(m => m.id === id);
        if (!msg) return;

        // Auto mark read first
        if (!msg.isRead) {
            msg.isRead = true;
            DB.saveMessage(msg);
        }

        document.getElementById('reply-client-msg').textContent = `"${msg.message}"`;
        document.getElementById('reply_subject').value = `Re: [${msg.subject}]`;
        document.getElementById('reply_body').value = `Kepada Yth. ${msg.name},

Terima kasih atas kiriman pesan Anda mengenai "${msg.subject}". Concierge Céleste dengan senang hati memproses permintaan Anda. Kami akan menghubungi Anda kembali dalam kurun waktu 1x24 jam untuk mendiskusikan rencana detail Anda.

Apabila Anda membutuhkan layanan segera, silakan hubungi kami di ${DB.getSettings().phoneContact}.

Hormat kami,
Layanan Concierge Céleste`;

        modalReply.classList.add('active');
    };

    // Form Submit: Reply Send (Simulated)
    formReply.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Simulasi email balasan berhasil terkirim ke client.');
        modalReply.classList.remove('active');
        refreshAllDashboardViews();
    });

    document.getElementById('btn-close-reply-modal').addEventListener('click', () => {
        modalReply.classList.remove('active');
    });

    // ================= 6. CONFIGURATION SETTINGS & SYSTEM MAINTENANCE =================

    // Form Submit: Save settings config
    formSettings.addEventListener('submit', (e) => {
        e.preventDefault();

        const restaurantName = document.getElementById('set_name').value.trim();
        const maxCapacity = parseInt(document.getElementById('set_capacity').value);
        const defaultArea = document.getElementById('set_area').value.trim();
        const openingHours = document.getElementById('set_hours').value.trim();
        const emailContact = document.getElementById('set_email').value.trim();
        const phoneContact = document.getElementById('set_phone').value.trim();
        const alertNotice = document.getElementById('set_alert').value.trim();

        DB.saveSettings({
            restaurantName, maxCapacity, defaultArea, openingHours, emailContact, phoneContact, alertNotice
        });

        showToast('Pengaturan konfigurasi restoran berhasil disimpan.');
        refreshAllDashboardViews();
    });

    // Button: Reset DB to default seed data
    document.getElementById('btn-reset-db').addEventListener('click', () => {
        if (confirm('PERINGATAN: Opsi ini akan menghapus seluruh data kustom saat ini dan mengembalikannya ke bibit awal (seed data) bawaan. Lanjutkan?')) {
            localStorage.clear();
            DB.init();
            showToast('Database berhasil diset ulang. Memuat ulang halaman...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    });

    // Close modals on clicking overlay backdrop
    window.addEventListener('click', (e) => {
        if (e.target === modalRes) modalRes.classList.remove('active');
        if (e.target === modalMenu) modalMenu.classList.remove('active');
        if (e.target === modalReply) modalReply.classList.remove('active');
    });

    // --- Auxiliary Helpers ---
    const escapeHTML = (str) => {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    };

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

    // --- Init portal views ---
    refreshAllDashboardViews();
    renderSettingsForm();
});
