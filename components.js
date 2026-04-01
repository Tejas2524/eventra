export const Components = {
    Navbar() {
        return `
        <nav class="navbar glass">
            <div class="logo">Eventra</span></div>
            <ul class="nav-links">
                <li><a href="#" class="nav-link" data-route="home">Explore</a></li>
                <li><a href="#" class="nav-link" data-route="dashboard">Dashboard</a></li>
                <li><a href="#" class="nav-link" data-route="about">About</a></li>
                <li><a href="#" class="nav-link" data-route="contact">Contact</a></li>
            </ul>
        </nav>`;
    },

    EventCard(event) {
        const eventDate = new Date(event.event_date);
        const isPast = eventDate < new Date();
        const dateTag = isPast ? '<span class="status-badge cancelled" style="position:absolute; top: 1rem; right: 1rem; font-size: 0.7rem;">Past Event</span>' 
                               : '<span class="status-badge confirmed" style="position:absolute; top: 1rem; right: 1rem; font-size: 0.7rem;">Upcoming</span>';
        
        return `
        <div class="event-card glass" style="position: relative;">
            ${dateTag}
            <div class="event-date">
                <span class="month">${eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                <span class="day">${eventDate.getDate()}</span>
            </div>
            <div class="event-details">
                <span class="category">${event.event_type}</span>
                <h3>${event.event_name}</h3>
                <p class="location">📍 ${event.venue?.venue_name || 'TBA'}</p>
                <p class="organizer">👥 ${event.organizer?.name || 'College'}</p>
            </div>
            <button class="btn view-details-btn ${isPast ? 'secondary' : 'primary'}" data-id="${event.event_id}">
                ${isPast ? 'View Past Event' : 'View Details'}
            </button>
        </div>`;
    },

    EventDetails(eventData) {
        if (!eventData) return `<p>Event not found.</p>`;
        
        const eventDate = new Date(eventData.event_date);
        const isPast = eventDate < new Date();
        
        const scheduleHtml = eventData.schedules && eventData.schedules.length > 0 
            ? eventData.schedules.map(s => `
                <div class="timeline-item glass">
                    <div class="time">${new Date(s.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div class="activity">${s.activity_description}</div>
                </div>
            `).join('')
            : '<p class="glass placeholder" style="padding: 1rem;">No schedule available yet.</p>';

        return `
        <div class="event-detail-view animate-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <button class="btn secondary back-btn" data-route="home">&larr; Back to Events</button>
                <button class="btn secondary share-btn" onclick="alert('Link copied to clipboard!')">🔗 Share Event</button>
            </div>
            <div class="detail-hero glass">
                <span class="category tag">${eventData.event_type}</span>
                <h2>${eventData.event_name}</h2>
                <p class="description">${eventData.description}</p>
            </div>
            
            <div class="detail-grid">
                <div class="info-card glass">
                    <h4>When & Where</h4>
                    <p>📅 ${eventDate.toLocaleDateString()}</p>
                    <p>🏛️ ${eventData.venue?.venue_name || 'N/A'}</p>
                    <p>📍 ${eventData.venue?.location || 'N/A'} (Capacity: ${eventData.venue?.capacity || 'N/A'})</p>
                </div>
                
                <div class="info-card glass">
                    <h4>Organizer Info</h4>
                    <p>👤 ${eventData.organizer?.name || 'N/A'}</p>
                    <p>✉️ ${eventData.organizer?.email || 'N/A'}</p>
                    <p>🔖 ${eventData.organizer?.role || 'N/A'}</p>
                </div>
            </div>

            <div class="schedule-section">
                <h3>Event Schedule</h3>
                <div class="timeline">
                    ${scheduleHtml}
                </div>
            </div>

            <div class="action-section glass">
                <h3>${isPast ? 'This event has concluded' : 'Join this event'}</h3>
                ${!isPast ? `<button class="btn primary btn-large register-btn" data-id="${eventData.event_id}">Register Now</button>
                             <button class="btn secondary btn-large" style="margin-left: 1rem;" onclick="alert('Added to your calendar!')">📅 Add to Calendar</button>` 
                          : `<p>Thank you to everyone who participated!</p>`}
            </div>
        </div>`;
    },

    Dashboard(registrations) {
        const userProfile = `
        <div class="glass" style="padding: 2rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.5rem;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold;">
                AJ
            </div>
            <div>
                <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem;">Alice Johnson</h3>
                <p>Computer Science Engineering • Class of 2027</p>
                <p>Student ID: 1004523</p>
            </div>
        </div>
        `;

        if (registrations.length === 0) {
            return `
            <div class="dashboard-view animate-in">
                <h2>My Dashboard</h2>
                ${userProfile}
                <div class="glass empty-state" style="padding: 3rem; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎫</div>
                    <p style="font-size: 1.2rem; margin-bottom: 1.5rem;">You haven't registered for any events yet!</p>
                    <button class="btn primary nav-link" data-route="home">Explore Events</button>
                </div>
            </div>`;
        }

        const now = new Date();
        const upcomingRegs = registrations.filter(reg => new Date(reg.event.event_date) >= now);
        const pastRegs = registrations.filter(reg => new Date(reg.event.event_date) < now);

        const renderRegs = (regs) => regs.map(reg => `
            <div class="reg-card glass">
                <div class="reg-info">
                    <h4>${reg.event.event_name}</h4>
                    <p class="date">📅 ${new Date(reg.event.event_date).toLocaleDateString()}</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.8;">Reg ID: #${reg.registration_id.toString().padStart(6, '0')}</p>
                </div>
                <div class="reg-status">
                    <span class="status-badge ${reg.status.toLowerCase()}">${reg.status}</span>
                    ${reg.payment ? `<span class="payment-badge" style="margin-top: 5px; display: inline-block;">💸 $${reg.payment.amount}</span>` : ''}
                    ${new Date(reg.event.event_date) >= now ? `<button class="btn secondary cancel-btn" style="margin-top: 0.5rem; padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="alert('Cancellation requested.')">Cancel</button>` : ''}
                </div>
            </div>
        `).join('');

        return `
        <div class="dashboard-view animate-in">
            <h2>My Dashboard</h2>
            ${userProfile}
            
            <h3 style="margin-top: 2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--glass-border);">Upcoming Events (${upcomingRegs.length})</h3>
            <div class="registration-list" style="display: flex; flex-direction: column; gap: 1rem;">
                ${upcomingRegs.length ? renderRegs(upcomingRegs) : '<p class="glass" style="padding: 1rem; text-align: center;">No upcoming events.</p>'}
            </div>

            <h3 style="margin-top: 3rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--glass-border);">Past Events (${pastRegs.length})</h3>
            <div class="registration-list" style="display: flex; flex-direction: column; gap: 1rem; opacity: 0.8;">
                ${pastRegs.length ? renderRegs(pastRegs) : '<p class="glass" style="padding: 1rem; text-align: center;">No past events.</p>'}
            </div>
        </div>`;
    },

    About() {
        return `
        <div class="about-view animate-in" style="max-width: 800px; margin: 0 auto;">
            <div class="hero glass" style="margin-bottom: 2rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">About Eventra</h1>
                <p>Revolutionizing how students connect with campus life.</p>
            </div>
            
            <div class="glass" style="padding: 2.5rem; line-height: 1.8; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--accent);">Our Mission</h3>
                <p style="margin-bottom: 1.5rem;">Eventra was created with a single goal: to make discovering, registering, and managing college events as seamless and engaging as possible. We believe that extracurricular activities are the heartbeat of campus life and essential for holistic student development.</p>
                
                <h3 style="margin-bottom: 1rem; color: var(--accent);">The Platform</h3>
                <p style="margin-bottom: 1.5rem;">Built by students, for students. This platform is powered by modern technologies, utilizing a robust Supabase backend and a dynamic frontend architecture. It provides real-time updates, secure registrations, and a centralized dashboard for all your academic and cultural events.</p>
                
                <h3 style="margin-bottom: 1rem; color: var(--accent);">Join the Community</h3>
                <p>Whether you're looking to attend the next big hackathon, participate in a cultural fest, or join an academic seminar, Eventra is your gateway. Step out of the classroom and start exploring!</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div class="glass" style="padding: 2rem; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎓</div>
                    <h4>Student Centric</h4>
                    <p style="font-size: 0.9rem;">Designed with the student experience in mind.</p>
                </div>
                <div class="glass" style="padding: 2rem; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
                    <h4>Future Ready</h4>
                    <p style="font-size: 0.9rem;">Empowering the leaders of tomorrow.</p>
                </div>
            </div>
        </div>`;
    },

    Contact() {
        return `
        <div class="contact-view animate-in" style="max-width: 900px; margin: 0 auto;">
            <div class="hero glass" style="margin-bottom: 2rem; padding: 3rem 2rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Get in Touch</h1>
                <p>Have questions or want to partner with us? We're here to help.</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem;">
                <div class="glass" style="padding: 2.5rem;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--accent);">Contact Information</h3>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div>
                            <h4 style="margin-bottom: 0.3rem;">📍 Location</h4>
                            <p>Student Union Building, Room 204<br>University Campus</p>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 0.3rem;">📧 Email</h4>
                            <p>support@nexusevents.edu</p>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 0.3rem;">📞 Phone</h4>
                            <p>+1 (555) 123-4567<br>Mon-Fri, 9am - 5pm</p>
                        </div>
                    </div>
                </div>
                
                <div class="glass" style="padding: 2.5rem;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--accent);">Send a Message</h3>
                    <form onsubmit="event.preventDefault(); alert('Message sent successfully! We will get back to you soon.'); this.reset();" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label for="name">Your Name</label>
                            <input type="text" id="name" required class="form-input" placeholder="e.g. Alice Johnson" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label for="email">Your Email</label>
                            <input type="email" id="email" required class="form-input" placeholder="e.g. alice@university.edu" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label for="subject">Subject</label>
                            <input type="text" id="subject" required class="form-input" placeholder="How can we help?" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label for="message">Message</label>
                            <textarea id="message" required rows="4" class="form-input" placeholder="Your message here..." style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: white; resize: vertical;"></textarea>
                        </div>
                        <button type="submit" class="btn primary btn-large" style="margin-top: 1rem;">Send Message</button>
                    </form>
                </div>
            </div>
        </div>`;
    },

    NotFound() {
        return `
        <div class="notfound-view animate-in" style="min-height: 60vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
            <div class="glass" style="padding: 4rem; max-width: 500px;">
                <h1 style="font-size: 5rem; color: var(--accent); margin-bottom: 1rem; line-height: 1;">404</h1>
                <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Page Not Found</h3>
                <p style="margin-bottom: 2rem;">Oops! The page you are looking for doesn't exist or has been moved.</p>
                <button class="btn primary btn-large nav-link" data-route="home">Return Home</button>
            </div>
        </div>`;
    }
};
