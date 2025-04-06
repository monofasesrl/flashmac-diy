import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

// Database operations
export const dbOps = {
  async initDb() {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn("Session error:", sessionError);
      }

      // If no session, try to sign in anonymously
      if (!session) {
        try {
          const { error: signInError } = await supabase.auth.signInAnonymously();
          if (signInError) {
            console.warn("Anonymous sign-in failed:", signInError);
            // Create a public user for accessing public pages
            await this.createPublicUser();
          }
        } catch (error) {
          console.warn("Error during anonymous sign-in:", error);
          // Create a public user as fallback
          await this.createPublicUser();
        }
      }

      // Test connection - don't throw on "No rows found" errors
      try {
        await supabase
          .from('settings')
          .select('value')
          .eq('key', 'terms_and_conditions')
          .single();
      } catch (error: any) {
        if (!error.message?.includes('No rows found')) {
          console.warn("Connection test error:", error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Supabase connection:', error);
      return false;
    }
  },

  async createPublicUser() {
    // Try to use stored credentials if available
    const storedEmail = localStorage.getItem('publicUserEmail');
    const storedPassword = localStorage.getItem('publicUserPassword');
    
    if (storedEmail && storedPassword) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: storedEmail,
          password: storedPassword
        });
        
        if (!error) {
          return; // Successfully signed in with stored credentials
        }
      } catch (e) {
        console.warn("Failed to sign in with stored credentials:", e);
      }
    }
    
    // Create a new public user
    try {
      const tempEmail = `public-${Date.now()}@example.com`;
      const tempPassword = `Public${Math.random().toString(36).substring(2, 10)}`;
      
      const { error } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword
      });
      
      if (!error) {
        // Store credentials for future use
        localStorage.setItem('publicUserEmail', tempEmail);
        localStorage.setItem('publicUserPassword', tempPassword);
      }
    } catch (e) {
      console.error("Failed to create public user:", e);
    }
  },

  async createTicket(data: any) {
    try {
      const ticketNumber = `FM-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([{
          ticket_number: ticketNumber,
          description: data.description || '',
          status: data.status || 'Ticket inserito',
          priority: data.priority || 'medium',
          customer_name: data.customer_name || '',
          customer_email: data.customer_email || '',
          customer_phone: data.customer_phone || null,
          device_type: data.device_type || '',
          price: data.price || null,
          user_id: data.user_id,
          assigned_to: data.assigned_to || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email');
      
      // Send email notification for new ticket
      if (ticket) {
        emailService.sendNewTicketNotification(ticket).catch(err => {
          console.error('Failed to send new ticket notification:', err);
        });
      }
      
      return { id: ticket.id, ticket_number: ticket.ticket_number };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  async getTickets(sortField = 'created_at', sortOrder = 'desc') {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tickets:', error);
      return [];
    }
  },

  async getTicketById(id: string) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // If no ticket found, return null instead of throwing
        if (error.message?.includes('No rows found')) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error getting ticket:', error);
      return null;
    }
  },

  async updateTicket(id: string, data: any) {
    try {
      // Get the current ticket to compare status
      const { data: currentTicket, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const oldStatus = currentTicket.status;
      const statusChanged = data.status && data.status !== oldStatus;
      
      // Update the ticket
      const { error } = await supabase
        .from('tickets')
        .update({
          description: data.description,
          status: data.status,
          priority: data.priority,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          device_type: data.device_type,
          price: data.price,
          assigned_to: data.assigned_to,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // If status changed, send notification
      if (statusChanged) {
        // Get the updated ticket
        const { data: updatedTicket } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', id)
          .single();
          
        if (updatedTicket) {
          // Import email service dynamically to avoid circular dependencies
          const { emailService } = await import('./email');
          
          // Send status change notification
          emailService.sendStatusChangeNotification(updatedTicket, oldStatus).catch(err => {
            console.error('Failed to send status change notification:', err);
          });
        }
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  async deleteTicket(id: string) {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  async getSetting(key: string) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        // If the setting doesn't exist, return null instead of throwing an error
        if (error.message?.includes('No rows found')) {
          return null;
        }
        throw error;
      }
      return data.value;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  },

  async setSetting(key: string, value: string) {
    try {
      // First check if the setting exists
      const { data, error: selectError } = await supabase
        .from('settings')
        .select('key')
        .eq('key', key)
        .single();
      
      if (selectError && !selectError.message?.includes('No rows found')) {
        throw selectError;
      }
      
      // If setting exists, update it; otherwise insert it
      if (data) {
        const { error } = await supabase
          .from('settings')
          .update({ value })
          .eq('key', key);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert({ key, value });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error setting setting:', error);
      throw error;
    }
  },
  
  async checkOldTickets() {
    try {
      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email');
      
      // Send notification for old tickets
      return await emailService.sendOldTicketsNotification();
    } catch (error) {
      console.error('Error checking old tickets:', error);
      return false;
    }
  }
};
