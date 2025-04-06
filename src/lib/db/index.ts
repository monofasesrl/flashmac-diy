import { supabase } from '../supabase';
import { emailService } from '../email';
import type { Ticket } from '../../types';

export const dbOps = {
  /**
   * Initialize database connection
   */
  async initDb(): Promise<void> {
    // This function is mainly for compatibility
    // It can be used to check authentication or perform initial setup
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found');
    }
    return;
  },

  /**
   * Get a setting value from the database
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Setting not found
          return null;
        }
        throw error;
      }

      return data?.value || null;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return null;
    }
  },

  /**
   * Set a setting value in the database
   */
  async setSetting(key: string, value: string): Promise<boolean> {
    try {
      // Check if setting exists
      const { data: existingData } = await supabase
        .from('settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existingData) {
        // Update existing setting
        const { error } = await supabase
          .from('settings')
          .update({ value })
          .eq('key', key);

        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('settings')
          .insert({ key, value });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw new Error(`Impossibile salvare l'impostazione ${key}`);
    }
  },

  /**
   * Create a new ticket
   */
  async createTicket(ticketData: Partial<Ticket>): Promise<{ id: string }> {
    try {
      // Generate ticket number if not provided
      if (!ticketData.ticket_number) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        // Get the latest ticket number for this month
        const { data: latestTickets } = await supabase
          .from('tickets')
          .select('ticket_number')
          .ilike('ticket_number', `FM-${year}-${month}-%`)
          .order('ticket_number', { ascending: false })
          .limit(1);
        
        let sequenceNumber = 1;
        if (latestTickets && latestTickets.length > 0) {
          const latestNumber = latestTickets[0].ticket_number;
          const match = latestNumber.match(/FM-\d{4}-\d{2}-(\d+)/);
          if (match && match[1]) {
            sequenceNumber = parseInt(match[1], 10) + 1;
          }
        }
        
        ticketData.ticket_number = `FM-${year}-${month}-${String(sequenceNumber).padStart(4, '0')}`;
      }
      
      // Insert the ticket
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      return { id: data.id };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw new Error('Impossibile creare il ticket');
    }
  },

  /**
   * Get a ticket by ID
   */
  async getTicketById(id: string): Promise<Ticket | null> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Ticket not found
          return null;
        }
        throw error;
      }
      
      return data as Ticket;
    } catch (error) {
      console.error(`Error getting ticket ${id}:`, error);
      throw new Error('Impossibile recuperare il ticket');
    }
  },

  /**
   * Update a ticket
   */
  async updateTicket(id: string, ticketData: Partial<Ticket>): Promise<void> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update(ticketData)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw new Error('Impossibile aggiornare il ticket');
    }
  },

  /**
   * Delete a ticket
   */
  async deleteTicket(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      throw new Error('Impossibile eliminare il ticket');
    }
  },

  /**
   * Check for old tickets and send notification if needed
   */
  async checkOldTickets(): Promise<boolean> {
    try {
      return await emailService.sendOldTicketsNotification();
    } catch (error) {
      console.error('Error checking old tickets:', error);
      throw new Error('Impossibile controllare i ticket vecchi');
    }
  }
};
