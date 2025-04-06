import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbOps } from '../lib/db';
import { PrintableTicket } from '../components/PrintableTicket';
import { supabase } from '../lib/supabase';
import type { Ticket, TicketAttachment } from '../types';

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [terms, setTerms] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', id)
          .single();
        
        if (ticketError) throw ticketError;
        
        // Fetch attachments if any
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('ticket_attachments')
          .select('*')
          .eq('ticket_id', id);
        
        if (attachmentsError) throw attachmentsError;
        
        // Fetch terms and conditions
        const termsText = await dbOps.getSetting('terms_and_conditions');
        
        setTicket(ticketData);
        setAttachments(attachmentsData || []);
        setTerms(termsText);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setError('Errore nel caricamento del ticket');
        setLoading(false);
      }
    };
    
    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/50 p-6 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-red-500 max-w-md">
          <p className="text-red-200">{error || 'Ticket non trovato'}</p>
          <button
            onClick={() => navigate('/tickets')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Torna alla lista
          </button>
        </div>
      </div>
    );
  }

  // Add terms to ticket for printing
  const ticketWithTerms = {
    ...ticket,
    terms: terms || undefined,
    attachments: attachments
  };

  return <PrintableTicket ticket={ticketWithTerms} />;
}
