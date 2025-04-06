export interface Ticket {
  id: string;
  ticket_number: string;  // Format: FM-YYYY-MM-NNNN
  description: string;
  status: 'Ticket inserito' | 'In assegnazione al tecnico' | 'In lavorazione' | 'Parti ordinate' | 'Pronto per il ritiro' | 'Chiuso' | 'Preventivo inviato' | 'Preventivo accettato' | 'Rifiutato';
  priority: 'low' | 'medium' | 'high';
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  device_type: string;
  price: number | null;
  purchase_date?: string;
  order_id?: string;
  password?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  assigned_to?: string | null;
  assigned_to_email?: string | null;
  terms?: string;
  attachments?: TicketAttachment[];
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_url: string;
  file_type: 'image' | 'video';
  uploaded_at: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}
