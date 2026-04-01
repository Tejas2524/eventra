import { supabase } from './supabaseClient.js';

// Dummy Data imitating Supabase tables (Commented out, keep as reference)
/*
export const Database = {
    students: [...],
    organizers: [...],
    venues: [...],
    events: [...],
    schedules: [...],
    registrations: [...],
    payments: [...]
};
*/

export const dbClient = {
    async getEvents() {
        // Query events table and join venues and organizers
        const { data, error } = await supabase
            .from('events')
            .select(`
                *,
                venue:venues(*),
                organizer:organizers(*)
            `);
            
        if (error) {
            console.error("Error fetching events:", error);
            alert("Error fetching events from Supabase. Ensure your database tables are set up correctly.");
            return [];
        }
        
        // Supabase might return venue/organizer as an array if the relation is incorrectly mapped, 
        // but typically one-to-one or many-to-one returns an object
        return data || [];
    },
    
    async getEventDetails(eventId) {
        // Query specific event and join related tables including schedules
        const { data, error } = await supabase
            .from('events')
            .select(`
                *,
                venue:venues(*),
                organizer:organizers(*),
                schedules(*)
            `)
            .eq('event_id', eventId)
            .single();
            
        if (error) {
            console.error("Error fetching event details:", error);
            return null;
        }
        
        return data;
    },
    
    async registerForEvent(studentId, eventId, amount = 0) {
        // Insert new registration
        const { data: newReg, error: regError } = await supabase
            .from('registrations')
            .insert([{
                student_id: studentId,
                event_id: eventId,
                status: "Confirmed",
                registration_date: new Date().toISOString()
            }])
            .select()
            .single();

        if (regError) {
            console.error("Error registering for event:", regError);
            alert("Registration failed: " + regError.message);
            return null;
        }

        // If payment is required, insert into payments table
        if (amount > 0 && newReg) {
            const { error: payError } = await supabase
                .from('payments')
                .insert([{
                    registration_id: newReg.registration_id, // Match this with your primary key
                    amount: amount,
                    payment_date: new Date().toISOString(),
                    payment_status: "Paid"
                }]);
                
            if (payError) {
                console.error("Error creating payment:", payError);
                alert("Payment creation failed: " + payError.message);
            }
        }
        
        return newReg;
    },
    
    async getStudentRegistrations(studentId) {
        // Query registrations for the logged in student, joining event and payments
        const { data, error } = await supabase
            .from('registrations')
            .select(`
                *,
                event:events(*),
                payment:payments(*)
            `)
            .eq('student_id', studentId);
            
        if (error) {
            console.error("Error fetching student registrations:", error);
            return [];
        }
        
        // Format the response since payments(*) returns an array but the app expects an object
        return data.map(reg => {
            return {
                ...reg,
                payment: Array.isArray(reg.payment) ? reg.payment[0] : reg.payment
            };
        });
    }
};
