import { useEffect, useState } from 'react';
import { dbOps } from '../lib/db';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Ticket } from '../types';
import { StatusBadge } from './StatusBadge';
import { StatusSelect } from './StatusSelect';
import { useI18n } from '../lib/i18n/context';
import { supabase } from '../lib/supabase';

interface TicketWithUser extends Omit<Ticket, 'assigned_to_email'> {
  created_by_email: string;
  assigned_to_email: string | null;
}

type SortField = 'created_at' | 'priority';
type SortOrder = 'asc' | 'desc';

export function TicketList() {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<TicketWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<TicketWithUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verifica la sessione corrente
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No active session found');
          setError('Sessione non attiva. Effettua il login.');
          setLoading(false);
          return;
        }
        
        // Fetch tickets direttamente da Supabase
        const { data, error: fetchError } = await supabase
          .from('tickets')
          .select('*')
          .order(sortField, { ascending: sortOrder === 'asc' });
        
        if (fetchError) {
          console.error('Error fetching tickets:', fetchError);
          setError(`Errore nel caricamento dei ticket: ${fetchError.message}`);
          setLoading(false);
          return;
        }
        
        setTickets(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchTickets:', error);
        setError('Errore imprevisto durante il caricamento dei ticket');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [sortField, sortOrder]);

  const refreshTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tickets')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });
      
      if (fetchError) throw fetchError;
      
      setTickets(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing tickets:', error);
      setError('Errore durante l\'aggiornamento dei ticket');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('tickets.messages.deleteConfirm'))) {
      try {
        await dbOps.deleteTicket(id);
        refreshTickets();
      } catch (error) {
        alert(t('tickets.messages.updateError') + error);
      }
    }
  };

  const handleEdit = (ticket: TicketWithUser) => {
    setEditingTicket(ticket);
  };

  const handleSave = async (ticket: TicketWithUser) => {
    try {
      await dbOps.updateTicket(ticket.id, {
        description: ticket.description,
        customer_name: ticket.customer_name,
        customer_email: ticket.customer_email,
        customer_phone: ticket.customer_phone,
        device_type: ticket.device_type,
        priority: ticket.priority,
        status: ticket.status,
        price: ticket.price,
        assigned_to: ticket.assigned_to
      });
      setEditingTicket(null);
      refreshTickets();
    } catch (error) {
      alert(t('tickets.messages.updateError') + error);
    }
  };

  const handleCancel = () => {
    setEditingTicket(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTicketContainerClasses = (priority: string, createdByEmail: string) => {
    const baseClasses = "bg-gray-900/50 p-6 rounded-lg shadow-xl backdrop-blur-sm transition-all duration-200";
    
    if (priority === 'high') {
      return `${baseClasses} ring-2 ring-red-500 shadow-red-500/20 hover:shadow-red-500/30`;
    }

    if (createdByEmail === 'paglia@flashmac.com') {
      return `${baseClasses} ring-2 ring-yellow-500 shadow-yellow-500/20 hover:shadow-yellow-500/30`;
    }
    
    return `${baseClasses} ring-1 ring-gray-800/50 hover:ring-gray-700/50`;
  };

  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        (ticket.ticket_number?.toLowerCase() || '').includes(searchLower) ||
        (ticket.description?.toLowerCase() || '').includes(searchLower) ||
        (ticket.customer_name?.toLowerCase() || '').includes(searchLower) ||
        (ticket.customer_email?.toLowerCase() || '').includes(searchLower) ||
        (ticket.customer_phone?.toLowerCase() || '').includes(searchLower) ||
        (ticket.device_type?.toLowerCase() || '').includes(searchLower) ||
        (ticket.status?.toLowerCase() || '').includes(searchLower) ||
        (ticket.priority?.toLowerCase() || '').includes(searchLower) ||
        (ticket.created_by_email?.toLowerCase() || '').includes(searchLower) ||
        (ticket.assigned_to_email?.toLowerCase() || '').includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    if (statusFilter && ticket.status !== statusFilter) {
      return false;
    }

    if (priorityFilter && ticket.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  const inputClasses = `
    mt-1 block w-full rounded-lg border-0 bg-gray-800/50 
    text-white shadow-sm ring-1 ring-inset ring-gray-700 
    placeholder:text-gray-400 
    focus:ring-2 focus:ring-inset focus:ring-purple-500
    hover:ring-gray-600
    transition-shadow duration-200
  `;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900/50 p-6 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-gray-800/50">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 p-6 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-red-500">
        <p className="text-red-200">{error}</p>
        <button
          onClick={refreshTickets}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900/50 p-4 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-gray-800/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('tickets.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={inputClasses}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClasses}
            >
              <option value="">{t('tickets.status.allStatuses')}</option>
              <option value="Ticket inserito">{t('tickets.status.Ticket inserito')}</option>
              <option value="In assegnazione al tecnico">{t('tickets.status.In assegnazione al tecnico')}</option>
              <option value="In lavorazione">{t('tickets.status.In lavorazione')}</option>
              <option value="Parti ordinate">{t('tickets.status.Parti ordinate')}</option>
              <option value="Preventivo inviato">{t('tickets.status.Preventivo inviato')}</option>
              <option value="Preventivo accettato">{t('tickets.status.Preventivo accettato')}</option>
              <option value="Rifiutato">{t('tickets.status.Rifiutato')}</option>
              <option value="Pronto per il ritiro">{t('tickets.status.Pronto per il ritiro')}</option>
              <option value="Chiuso">{t('tickets.status.Chiuso')}</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={inputClasses}
            >
              <option value="">{t('tickets.priority.all')}</option>
              <option value="low">{t('tickets.priority.low')}</option>
              <option value="medium">{t('tickets.priority.medium')}</option>
              <option value="high">{t('tickets.priority.high')}</option>
            </select>

            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className={inputClasses}
            >
              <option value="created_at">{t('tickets.sort.date')}</option>
              <option value="priority">{t('tickets.sort.priority')}</option>
            </select>
            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-lg border border-gray-700 hover:bg-gray-800/50 text-gray-300"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-gray-900/50 p-6 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-gray-800/50">
          <p className="text-gray-300 text-center">Nessun ticket trovato</p>
        </div>
      ) : (
        filteredTickets.map((ticket) => (
          <div key={ticket.id} className={getTicketContainerClasses(ticket.priority, ticket.created_by_email || '')}>
            {editingTicket?.id === ticket.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">{t('tickets.description')}</label>
                  <textarea
                    value={editingTicket.description}
                    onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                    className={`${inputClasses} min-h-[100px]`}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">{t('tickets.customerName')}</label>
                    <input
                      type="text"
                      value={editingTicket.customer_name}
                      onChange={(e) => setEditingTicket({ ...editingTicket, customer_name: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">{t('tickets.customerEmail')}</label>
                    <input
                      type="email"
                      value={editingTicket.customer_email}
                      onChange={(e) => setEditingTicket({ ...editingTicket, customer_email: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">{t('tickets.customerPhone')}</label>
                    <input
                      type="tel"
                      value={editingTicket.customer_phone || ''}
                      onChange={(e) => setEditingTicket({ ...editingTicket, customer_phone: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">{t('tickets.deviceType')}</label>
                    <input
                      type="text"
                      value={editingTicket.device_type}
                      onChange={(e) => setEditingTicket({ ...editingTicket, device_type: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">{t('tickets.price')}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingTicket.price || ''}
                      onChange={(e) => setEditingTicket({ 
                        ...editingTicket, 
                        price: e.target.value ? parseFloat(e.target.value) : null 
                      })}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">{t('tickets.status.label')}</label>
                    <StatusSelect
                      value={editingTicket.status}
                      onChange={(value) => setEditingTicket({ ...editingTicket, status: value })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">{t('tickets.priority.label')}</label>
                    <select
                      value={editingTicket.priority}
                      onChange={(e) => setEditingTicket({ 
                        ...editingTicket, 
                        priority: e.target.value as 'low' | 'medium' | 'high' 
                      })}
                      className={inputClasses}
                    >
                      <option value="low">{t('tickets.priority.low')}</option>
                      <option value="medium">{t('tickets.priority.medium')}</option>
                      <option value="high">{t('tickets.priority.high')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">
                      {t('tickets.assignTo')}
                    </label>
                    <select
                      value={editingTicket.assigned_to || ''}
                      onChange={(e) => setEditingTicket({ 
                        ...editingTicket, 
                        assigned_to: e.target.value || null 
                      })}
                      className={inputClasses}
                    >
                      <option value="">{t('tickets.unassigned')}</option>
                      <option value="flashmac">flashmac</option>
                      <option value="paglia@flashmac.com">paglia@flashmac.com</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleCancel()}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                  >
                    {t('tickets.actions.cancel')}
                  </button>
                  <button
                    onClick={() => handleSave(editingTicket)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                  >
                    {t('tickets.actions.save')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-white">{ticket.ticket_number}</h3>
                    <p className="text-sm text-gray-400">
                      {format(new Date(ticket.created_at), 'PPp')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('tickets.detail.createdBy')}: {ticket.created_by_email}
                    </p>
                    {ticket.assigned_to_email && (
                      <p className="text-sm text-purple-400 mt-1">
                        {t('tickets.assignedTo')}: {ticket.assigned_to_email}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <StatusBadge status={ticket.status} />
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {t(`tickets.priority.${ticket.priority}`)}
                    </span>
                  </div>
                </div>
                
                <p className="mt-2 text-gray-300">{ticket.description}</p>
                
                <div className="mt-4 border-t border-gray-700/50 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-400">{t('tickets.customerName')}</p>
                      <p className="text-white">{ticket.customer_name}</p>
                      <div className="space-y-1">
                        <a 
                          href={`mailto:${ticket.customer_email}`}
                          className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {ticket.customer_email}
                        </a>
                        {ticket.customer_phone && (
                          <div className="flex space-x-2">
                            <a
                              href={`tel:${ticket.customer_phone.replace(/\D/g, '')}`}
                              className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <svg 
                                viewBox="0 0 24 24" 
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                              >
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                              </svg>
                              {ticket.customer_phone}
                            </a>
                            <a
                              href={`https://wa.me/${ticket.customer_phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-green-400 hover:text-green-300 transition-colors"
                            >
                              <svg 
                                viewBox="0 0 24 24" 
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400">{t('tickets.deviceType')}</p>
                      <p className="text-white">{ticket.device_type}</p>
                      {ticket.price && (
                        <p className="text-sm font-medium text-white">
                          {t('tickets.price')}: €{ticket.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <a
                    href={`/public/tickets/${ticket.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                  >
                    {t('tickets.actions.viewDetail')}
                  </a>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    target="_blank"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                  >
                    {t('tickets.actions.print')}
                  </Link>
                  <button
                    onClick={() => handleEdit(ticket)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                  >
                    {t('tickets.actions.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                  >
                    {t('tickets.actions.delete')}
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
