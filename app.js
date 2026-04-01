import { dbClient } from './db.js';
import { Components } from './components.js';

const STUDENT_ID = 1; // Hardcoded mock logged-in student (Alice)

const state = {
    events: [],
    registrations: [],
    currentView: 'home',
    searchQuery: ''
};

const appContainer = document.getElementById('app-content');

async function init() {
    renderNavbar();
    await handleRouteChange('home');
    setupGlobalListeners();
    
    // Add simple active state to nav items
    updateNavState('home');
}

function renderNavbar() {
    const navContainer = document.getElementById('navbar-container');
    navContainer.innerHTML = Components.Navbar();
}

function updateNavState(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.route === route) {
            link.style.color = 'var(--accent)';
        } else {
            link.style.color = 'var(--text-primary)';
        }
    });
}

async function handleRouteChange(route) {
    state.currentView = route;
    updateNavState(route);
    
    if (route === 'home') await loadHome();
    else if (route === 'dashboard') await loadDashboard();
    else if (route === 'about') loadAbout();
    else if (route === 'contact') loadContact();
    else loadNotFound();
}

async function loadHome() {
    if (!appContainer) return;
    appContainer.innerHTML = '<div class="loader animate-in glass">Loading events...</div>';
    
    // Fetch events only if empty to optimize, or re-fetch to get fresh
    state.events = await dbClient.getEvents();
    
    renderHomeView();
}

function renderHomeView() {
    const filteredEvents = state.events.filter(e => 
        e.event_name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
        e.event_type.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    let html = `
        <div class="hero animate-in glass" style="margin-bottom: 2rem;">
            <h1 style="font-size: 3.5rem;">Discover Campus Events</h1>
            <p style="font-size: 1.2rem; margin-top: 1rem; opacity: 0.9;">From hackathons to music fests, find your next transformative experience.</p>
            
            <div class="search-bar glass" style="margin-top: 2rem; display: flex; align-items: center; padding: 0.5rem 1rem; width: 100%; max-width: 600px;">
                <span style="font-size: 1.2rem; margin-right: 0.5rem;">🔍</span>
                <input type="text" id="event-search" placeholder="Search events by name or category..." value="${state.searchQuery}"
                       style="flex: 1; background: transparent; border: none; font-size: 1.1rem; color: var(--text-primary); outline: none;">
            </div>
        </div>
        
        <div class="event-grid animate-in" id="event-list">
            ${filteredEvents.length > 0 
                ? filteredEvents.map(e => Components.EventCard(e)).join('') 
                : '<div class="glass" style="grid-column: 1 / -1; padding: 3rem; text-align: center;"><p style="font-size: 1.2rem;">No events found matching your search.</p></div>'}
        </div>
    `;
    appContainer.innerHTML = html;

    // Attach search listener after rendering
    setTimeout(() => {
        const searchInput = document.getElementById('event-search');
        if (searchInput) {
            searchInput.focus();
            // Put cursor at the end
            searchInput.setSelectionRange(state.searchQuery.length, state.searchQuery.length);
            searchInput.addEventListener('input', (e) => {
                state.searchQuery = e.target.value;
                // Simple debounce might be nice but fast enough for mock
                renderHomeView();
            });
        }
    }, 0);
}

async function loadDetails(eventId) {
    if (!appContainer) return;
    appContainer.innerHTML = '<div class="loader animate-in glass">Loading event details...</div>';
    const eventData = await dbClient.getEventDetails(eventId);
    appContainer.innerHTML = Components.EventDetails(eventData);
}

async function loadDashboard() {
    if (!appContainer) return;
    appContainer.innerHTML = '<div class="loader animate-in glass">Loading dashboard...</div>';
    state.registrations = await dbClient.getStudentRegistrations(STUDENT_ID);
    appContainer.innerHTML = Components.Dashboard(state.registrations);
}

function loadAbout() {
    if (!appContainer) return;
    appContainer.innerHTML = '<div class="loader animate-in glass">Loading about page...</div>';
    setTimeout(() => {
        appContainer.innerHTML = Components.About();
    }, 300); // Simulate brief load for smooth transition
}

function loadContact() {
    if (!appContainer) return;
    appContainer.innerHTML = '<div class="loader animate-in glass">Loading contact page...</div>';
    setTimeout(() => {
        appContainer.innerHTML = Components.Contact();
    }, 300);
}

function loadNotFound() {
    if (!appContainer) return;
    appContainer.innerHTML = Components.NotFound();
}

async function handleRegister(eventId) {
    const isRegistered = state.registrations.some(r => r.event_id == eventId);
    if (isRegistered) {
        alert("You are already registered for this event!");
        return;
    }

    const confirmReg = confirm("Do you want to register for this event? Event fee is mock $50.00.");
    if (confirmReg) {
        await dbClient.registerForEvent(STUDENT_ID, parseInt(eventId), 50.00);
        alert("Registration confirmed!");
        handleRouteChange('dashboard');
    }
}

function setupGlobalListeners() {
    document.addEventListener('click', async (e) => {
        // Navigation routing
        const navTarget = e.target.closest('[data-route]');
        if (navTarget) {
            e.preventDefault();
            const route = navTarget.dataset.route;
            // Handle internal navigation for links
            if (route) handleRouteChange(route);
        }

        // View Details actions
        const detailBtn = e.target.closest('.view-details-btn');
        if (detailBtn) {
            const eventId = detailBtn.dataset.id;
            loadDetails(eventId);
        }

        // Action: Register
        const registerBtn = e.target.closest('.register-btn');
        if (registerBtn) {
            const eventId = registerBtn.dataset.id;
            // Fetch updated registrations to ensure no duplicate client-side state issues
            state.registrations = await dbClient.getStudentRegistrations(STUDENT_ID);
            handleRegister(eventId);
        }
    });

    // Simple window history popstate could be added here for back button support if desired
}

document.addEventListener('DOMContentLoaded', init);
