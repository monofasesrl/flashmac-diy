import { useEffect } from 'react';
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import type { Ticket } from '../types';

interface PrintableTicketProps {
  ticket: Ticket;
}

export function PrintableTicket({ ticket }: PrintableTicketProps) {
  useEffect(() => {
    // Add a class to the body for print styles
    document.body.classList.add('print-page');
    
    // Wait for images and fonts to load
    Promise.all([
      document.fonts.ready,
      ...Array.from(document.images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    ]).then(() => {
      // Small delay to ensure styles are applied
      setTimeout(() => {
        window.print();
      }, 500);
    });

    return () => {
      document.body.classList.remove('print-page');
    };
  }, []);

  return (
    <article className="print:text-black bg-white">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repair Ticket</h1>
          <p className="text-gray-600">{ticket.ticket_number}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Created: {format(new Date(ticket.created_at), 'PPp')}</p>
          <p className="text-sm text-gray-600">Last Updated: {format(new Date(ticket.updated_at), 'PPp')}</p>
        </div>
      </header>

      {/* Status and Priority */}
      <div className="flex gap-4 mb-6">
        <div>
          <StatusBadge status={ticket.status} />
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          ticket.priority === 'high' ? 'bg-red-100 text-red-800 print:bg-white print:text-black' :
          ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 print:bg-white print:text-black' :
          'bg-green-100 text-green-800 print:bg-white print:text-black'
        }`}>
          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
        </span>
      </div>

      {/* Customer Information */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">Customer Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Name</p>
            <p className="text-gray-900">{ticket.customer_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-gray-900">{ticket.customer_email}</p>
          </div>
          {ticket.customer_phone && (
            <div>
              <p className="text-sm font-medium text-gray-600">Telefono</p>
              <p className="text-gray-900">
                <a href={`tel:${ticket.customer_phone.replace(/\D/g, '')}`} className="text-blue-600 hover:underline">
                  {ticket.customer_phone}
                </a>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Device Information */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">Device Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Device Type</p>
            <p className="text-gray-900">{ticket.device_type}</p>
          </div>
          {ticket.price && (
            <div>
              <p className="text-sm font-medium text-gray-600">Price</p>
              <p className="text-gray-900">€{ticket.price.toFixed(2)}</p>
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">Description</h2>
        <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
      </section>

      {/* Attachments - Only shown in screen view, not in print */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <section className="mb-8 screen-only">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Attachments</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {ticket.attachments.map((attachment) => (
              <div key={attachment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {attachment.file_type === 'image' ? (
                  <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={attachment.file_url} 
                      alt="Ticket attachment" 
                      className="w-full h-32 object-cover"
                    />
                  </a>
                ) : (
                  <a 
                    href={attachment.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-32 bg-gray-100"
                  >
                    <div className="text-center">
                      <svg 
                        className="w-10 h-10 mx-auto text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        ></path>
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <p className="mt-1 text-sm text-gray-500">View Video</p>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Terms & Conditions - with reduced font size */}
      {ticket.terms && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Terms & Conditions</h2>
          <p className="text-gray-900 whitespace-pre-wrap text-xs">
            {ticket.terms}
          </p>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          This document was printed on {format(new Date(), 'PPp')}
        </p>
      </footer>
    </article>
  );
}
