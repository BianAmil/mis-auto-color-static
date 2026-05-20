/**
 * Celeste Culinary Group - Shared Local Database Manager
 * Uses localStorage to persist mock data for Menus, Reservations, Messages, and Settings.
 */

(function (global) {
    const STORAGE_KEYS = {
        MENU: 'celeste_menu',
        RESERVATIONS: 'celeste_reservations',
        MESSAGES: 'celeste_messages',
        SETTINGS: 'celeste_settings'
    };

    // Default Seed Data
    const defaultMenu = [
        {
            id: 'm1',
            name: 'Tartare de Saumon Sauvage',
            description: 'Wild salmon tartare, avocado mousse, Oscietra caviar, citrus vinaigrette, dill oil.',
            price: 28.00,
            category: 'appetizer',
            image: 'assets/images/menu_salmon.png',
            isSignature: true
        },
        {
            id: 'm2',
            name: 'Foie Gras Poêlé',
            description: 'Pan-seared duck foie gras, caramelized black mission figs, toasted brioche, port wine reduction.',
            price: 34.00,
            category: 'appetizer',
            image: 'assets/images/menu_foie_gras.png',
            isSignature: false
        },
        {
            id: 'm3',
            name: 'Truffled Burrata Pugliese',
            description: 'Creamy burrata, heirloom tomatoes, fresh black truffle shavings, 25-year aged balsamic, basil oil.',
            price: 26.00,
            category: 'appetizer',
            image: 'assets/images/menu_burrata.png',
            isSignature: true
        },
        {
            id: 'm4',
            name: 'Filet Mignon Rossini',
            description: 'Prime A5 Wagyu beef tenderloin, seared foie gras, truffle potato purée, glazed chanterelles, Madeira jus.',
            price: 68.00,
            category: 'main',
            image: 'assets/images/menu_wagyu.png',
            isSignature: true
        },
        {
            id: 'm5',
            name: 'Homard de Bretagne Poché',
            description: 'Butter-poached Brittany lobster tail, saffron arborio risotto, baby asparagus, coral emulsion.',
            price: 58.00,
            category: 'main',
            image: 'assets/images/menu_lobster.png',
            isSignature: true
        },
        {
            id: 'm6',
            name: 'Cabillaud Rôti aux Herbes',
            description: 'Herb-roasted Atlantic cod, braised baby fennel, clams, saffron-infused white wine velouté.',
            price: 46.00,
            category: 'main',
            image: 'assets/images/menu_cod.png',
            isSignature: false
        },
        {
            id: 'm7',
            name: 'L\'Or Noir Soufflé',
            description: 'Valrhona 70% dark chocolate soufflé, 24k gold leaf, house-made Madagascar vanilla bean gelato.',
            price: 22.00,
            category: 'dessert',
            image: 'assets/images/menu_souffle.png',
            isSignature: true
        },
        {
            id: 'm8',
            name: 'Mille-Feuille Céleste',
            description: 'Caramelized puff pastry layers, Tahitian vanilla diplomat cream, fleur de sel salted caramel.',
            price: 18.00,
            category: 'dessert',
            image: 'assets/images/menu_mille_feuille.png',
            isSignature: false
        },
        {
            id: 'm9',
            name: 'Le Golden Dusk (Signature Cocktail)',
            description: 'Aged cognac, gold-dusted orange peel, walnut bitters, smoked cedar wood smoke, crystal ice sphere.',
            price: 24.00,
            category: 'beverage',
            image: 'assets/images/menu_cocktail_gold.png',
            isSignature: true
        },
        {
            id: 'm10',
            name: 'Royal Emerald',
            description: 'Uji matcha infusion, elderflower liqueur, premium champagne, cucumber ribbon, fresh mint.',
            price: 20.00,
            category: 'beverage',
            image: 'assets/images/menu_cocktail_emerald.png',
            isSignature: false
        }
    ];

    const defaultReservations = [
        {
            id: 'r1',
            name: 'Sophia Loren',
            email: 'sophia@example.com',
            phone: '+1 (555) 019-2834',
            date: '2026-05-22',
            time: '19:00',
            guests: 2,
            area: 'main-salon',
            notes: 'Window table preferred. Celebrating anniversary.',
            status: 'Approved',
            created: '2026-05-19T14:32:00.000Z'
        },
        {
            id: 'r2',
            name: 'Lord Arthur Pendelton',
            email: 'arthur.p@noble.uk',
            phone: '+44 20 7946 0919',
            date: '2026-05-23',
            time: '20:30',
            guests: 4,
            area: 'private-vault',
            notes: 'Client dinner. Requires strict privacy and wine pairing menu.',
            status: 'Pending',
            created: '2026-05-20T09:15:00.000Z'
        },
        {
            id: 'r3',
            name: 'Marcus Aurelius',
            email: 'marcus.aur@philosophy.org',
            phone: '+39 06 1234 5678',
            date: '2026-05-21',
            time: '18:30',
            guests: 1,
            area: 'chef-counter',
            notes: 'N/A',
            status: 'Approved',
            created: '2026-05-20T17:40:00.000Z'
        },
        {
            id: 'r4',
            name: 'Isabella Rossellini',
            email: 'isabella.ross@cinema.it',
            phone: '+39 02 8765 4321',
            date: '2026-05-24',
            time: '21:00',
            guests: 3,
            area: 'terrace',
            notes: 'Shellfish allergy for one guest.',
            status: 'Pending',
            created: '2026-05-21T01:05:00.000Z'
        },
        {
            id: 'r5',
            name: 'Jean-Luc Godard',
            email: 'godard@nouvellevague.fr',
            phone: '+33 1 42 27 78 90',
            date: '2026-05-18',
            time: '20:00',
            guests: 2,
            area: 'main-salon',
            notes: 'Prefers quiet corner.',
            status: 'Completed',
            created: '2026-05-15T11:22:00.000Z'
        }
    ];

    const defaultMessages = [
        {
            id: 'msg1',
            name: 'Alexander Mercer',
            email: 'amercer@luxury-events.com',
            phone: '+1 (555) 304-9843',
            subject: 'Private Venue Buyout - Dec 2026',
            message: 'Greetings, I am looking to secure a buyout of Céleste for a private corporate gala on Saturday, December 12th, 2026. Expected guest list is 60 people. Please provide menus and package options.',
            created: '2026-05-20T10:44:00.000Z',
            isRead: false
        },
        {
            id: 'msg2',
            name: 'Elena Rostova',
            email: 'elena.rostova@gastronom.ru',
            phone: '+7 901 234-56-78',
            subject: 'Press Inquiry & Tasting Request',
            message: 'Hello, I write for Gastronom Magazine. We are doing a feature on Michelin culinary arts in the city and would love to interview Chef Céleste and photograph the tasting menu. Thank you.',
            created: '2026-05-19T08:12:00.000Z',
            isRead: true
        }
    ];

    const defaultSettings = {
        restaurantName: 'Céleste',
        maxCapacity: 45,
        defaultArea: 'main-salon',
        openingHours: 'Tuesday - Sunday: 17:00 - 23:00',
        alertNotice: 'Chef\'s Spring Tasting Menu is now available. Reservations required.',
        emailContact: 'concierge@celestegroup.com',
        phoneContact: '+62 822-3489-0919',
        address: 'Jalan Premium Boulevard No. 88, Suite 10, Luxury District'
    };

    // Helper functions
    function loadData(key, defaultData) {
        const data = localStorage.getItem(key);
        if (!data) {
            localStorage.setItem(key, JSON.stringify(defaultData));
            return defaultData;
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error(`Error parsing localStorage key: ${key}`, e);
            return defaultData;
        }
    }

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Database API Object
    const DB = {
        init: function () {
            loadData(STORAGE_KEYS.MENU, defaultMenu);
            loadData(STORAGE_KEYS.RESERVATIONS, defaultReservations);
            loadData(STORAGE_KEYS.MESSAGES, defaultMessages);
            loadData(STORAGE_KEYS.SETTINGS, defaultSettings);
            console.log('Céleste Database initialized successfully.');
        },

        // Menu CRUD
        getMenu: function () {
            return loadData(STORAGE_KEYS.MENU, defaultMenu);
        },
        getMenuItem: function (id) {
            const menu = this.getMenu();
            return menu.find(item => item.id === id);
        },
        saveMenuItem: function (item) {
            const menu = this.getMenu();
            if (item.id) {
                // Update
                const index = menu.findIndex(i => i.id === item.id);
                if (index !== -1) {
                    menu[index] = { ...menu[index], ...item };
                }
            } else {
                // Create
                item.id = 'm_' + Date.now();
                menu.push(item);
            }
            saveData(STORAGE_KEYS.MENU, menu);
            return item;
        },
        deleteMenuItem: function (id) {
            let menu = this.getMenu();
            menu = menu.filter(item => item.id !== id);
            saveData(STORAGE_KEYS.MENU, menu);
            return true;
        },

        // Reservations CRUD
        getReservations: function () {
            return loadData(STORAGE_KEYS.RESERVATIONS, defaultReservations);
        },
        saveReservation: function (res) {
            const reservations = this.getReservations();
            if (res.id) {
                // Update
                const index = reservations.findIndex(r => r.id === res.id);
                if (index !== -1) {
                    reservations[index] = { ...reservations[index], ...res };
                }
            } else {
                // Create
                res.id = 'res_' + Date.now();
                res.status = res.status || 'Pending';
                res.created = new Date().toISOString();
                reservations.push(res);
            }
            saveData(STORAGE_KEYS.RESERVATIONS, reservations);
            return res;
        },
        deleteReservation: function (id) {
            let reservations = this.getReservations();
            reservations = reservations.filter(r => r.id !== id);
            saveData(STORAGE_KEYS.RESERVATIONS, reservations);
            return true;
        },

        // Inquiries/Messages CRUD
        getMessages: function () {
            return loadData(STORAGE_KEYS.MESSAGES, defaultMessages);
        },
        saveMessage: function (msg) {
            const messages = this.getMessages();
            if (msg.id) {
                const index = messages.findIndex(m => m.id === msg.id);
                if (index !== -1) {
                    messages[index] = { ...messages[index], ...msg };
                }
            } else {
                msg.id = 'msg_' + Date.now();
                msg.created = new Date().toISOString();
                msg.isRead = false;
                messages.push(msg);
            }
            saveData(STORAGE_KEYS.MESSAGES, messages);
            return msg;
        },
        deleteMessage: function (id) {
            let messages = this.getMessages();
            messages = messages.filter(m => m.id !== id);
            saveData(STORAGE_KEYS.MESSAGES, messages);
            return true;
        },

        // Settings CRUD
        getSettings: function () {
            return loadData(STORAGE_KEYS.SETTINGS, defaultSettings);
        },
        saveSettings: function (newSettings) {
            const settings = this.getSettings();
            const updated = { ...settings, ...newSettings };
            saveData(STORAGE_KEYS.SETTINGS, updated);
            return updated;
        }
    };

    // Auto init on script load
    DB.init();

    // Export DB API to window
    global.CelesteDB = DB;

})(typeof window !== 'undefined' ? window : this);
