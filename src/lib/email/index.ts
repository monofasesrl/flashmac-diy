import { supabase } from '../supabase';
import { dbOps } from '../db';
import type { Ticket } from '../../types';

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export const emailService = {
  /**
   * Send an email using Supabase Edge Functions
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Call Supabase Edge Function for sending emails
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: options.to,
          subject: options.subject,
          body: options.body,
        }
      });

      if (error) {
        console.error('Error sending email:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  },

  /**
   * Send notification for a new ticket
   */
  async sendNewTicketNotification(ticket: Ticket): Promise<boolean> {
    try {
      // Check if new ticket notifications are enabled
      const emailNewTicket = await dbOps.getSetting('email_new_ticket');
      if (emailNewTicket !== 'true') {
        console.log('New ticket notifications are disabled');
        return false;
      }

      // Get admin email
      const adminEmail = await dbOps.getSetting('email_admin_address');
      if (!adminEmail) {
        console.log('Admin email not configured');
        return false;
      }

      // Prepare email content
      const subject = `Nuovo Ticket di Riparazione: ${ticket.ticket_number}`;
      const body = `
        <h2>Nuovo Ticket di Riparazione Creato</h2>
        <p><strong>Numero Ticket:</strong> ${ticket.ticket_number}</p>
        <p><strong>Cliente:</strong> ${ticket.customer_name}</p>
        <p><strong>Email:</strong> ${ticket.customer_email}</p>
        <p><strong>Dispositivo:</strong> ${ticket.device_type}</p>
        <p><strong>Descrizione:</strong> ${ticket.description}</p>
        <p><strong>Stato:</strong> ${ticket.status}</p>
        <p><strong>Priorità:</strong> ${ticket.priority}</p>
        <p>Visualizza i dettagli del ticket: ${window.location.origin}/tickets/${ticket.id}</p>
      `;

      // Send email
      return await this.sendEmail({
        to: adminEmail,
        subject,
        body
      });
    } catch (error) {
      console.error('Failed to send new ticket notification:', error);
      return false;
    }
  },

  /**
   * Send notification for a ticket status change
   */
  async sendStatusChangeNotification(ticket: Ticket, oldStatus: string): Promise<boolean> {
    try {
      // Check if status change notifications are enabled
      const emailStatusChange = await dbOps.getSetting('email_status_change');
      if (emailStatusChange !== 'true') {
        console.log('Status change notifications are disabled');
        return false;
      }

      // Get admin email
      const adminEmail = await dbOps.getSetting('email_admin_address');
      if (!adminEmail) {
        console.log('Admin email not configured');
        return false;
      }

      // Prepare email content
      const subject = `Stato Ticket Aggiornato: ${ticket.ticket_number}`;
      const body = `
        <h2>Stato Ticket di Riparazione Aggiornato</h2>
        <p><strong>Numero Ticket:</strong> ${ticket.ticket_number}</p>
        <p><strong>Cliente:</strong> ${ticket.customer_name}</p>
        <p><strong>Stato Cambiato:</strong> ${oldStatus} → ${ticket.status}</p>
        <p><strong>Dispositivo:</strong> ${ticket.device_type}</p>
        <p>Visualizza i dettagli del ticket: ${window.location.origin}/tickets/${ticket.id}</p>
      `;

      // Send email to admin
      const adminEmailSent = await this.sendEmail({
        to: adminEmail,
        subject,
        body
      });

      // Also send email to customer
      const customerEmailSent = await this.sendEmail({
        to: ticket.customer_email,
        subject: `Lo stato del tuo ticket di riparazione è stato aggiornato: ${ticket.ticket_number}`,
        body: `
          <h2>Lo Stato del Tuo Ticket di Riparazione è Stato Aggiornato</h2>
          <p>Gentile ${ticket.customer_name},</p>
          <p>Lo stato del tuo ticket di riparazione è stato aggiornato:</p>
          <p><strong>Numero Ticket:</strong> ${ticket.ticket_number}</p>
          <p><strong>Nuovo Stato:</strong> ${ticket.status}</p>
          <p><strong>Dispositivo:</strong> ${ticket.device_type}</p>
          <p>Puoi visualizzare i dettagli del tuo ticket: ${window.location.origin}/public/tickets/${ticket.id}</p>
          <p>Grazie per aver scelto il nostro servizio.</p>
        `
      });

      return adminEmailSent || customerEmailSent;
    } catch (error) {
      console.error('Failed to send status change notification:', error);
      return false;
    }
  },

  /**
   * Send notification for old tickets
   */
  async sendOldTicketsNotification(): Promise<boolean> {
    try {
      // Check if old tickets notifications are enabled
      const emailOldTickets = await dbOps.getSetting('email_admin_old_tickets');
      if (emailOldTickets !== 'true') {
        console.log('Old tickets notifications are disabled');
        return false;
      }

      // Get admin email
      const adminEmail = await dbOps.getSetting('email_admin_address');
      if (!adminEmail) {
        console.log('Admin email not configured');
        return false;
      }

      // Get days threshold
      const daysStr = await dbOps.getSetting('email_admin_old_tickets_days');
      const days = parseInt(daysStr || '7', 10);

      // Calculate the date threshold
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - days);

      // Get tickets older than the threshold that are not closed
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .lt('created_at', thresholdDate.toISOString())
        .not('status', 'eq', 'Chiuso');

      if (error) {
        console.error('Error fetching old tickets:', error);
        return false;
      }

      if (!tickets || tickets.length === 0) {
        console.log('No old tickets found');
        return false;
      }

      // Prepare email content
      const subject = `${tickets.length} Ticket in Attesa da Più di ${days} Giorni`;
      let ticketsHtml = '';
      
      tickets.forEach((ticket: any) => {
        ticketsHtml += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.ticket_number}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.customer_name}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${ticket.status}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(ticket.created_at).toLocaleDateString()}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">
              <a href="${window.location.origin}/tickets/${ticket.id}">Visualizza</a>
            </td>
          </tr>
        `;
      });

      const body = `
        <h2>Ticket in Attesa da Più di ${days} Giorni</h2>
        <p>I seguenti ticket sono aperti da più di ${days} giorni:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Numero Ticket</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Cliente</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Stato</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Data Creazione</th>
              <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Azione</th>
            </tr>
          </thead>
          <tbody>
            ${ticketsHtml}
          </tbody>
        </table>
      `;

      // Send email
      return await this.sendEmail({
        to: adminEmail,
        subject,
        body
      });
    } catch (error) {
      console.error('Failed to send old tickets notification:', error);
      return false;
    }
  }
};
