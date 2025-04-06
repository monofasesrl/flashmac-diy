import { useMemo } from 'react';
import type { Ticket } from '../types';

interface StatusBadgeProps {
  status: Ticket['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = useMemo(() => {
    switch (status) {
      case 'Ticket inserito': return 'bg-blue-100 text-blue-800 print:bg-white print:text-black';
      case 'In assegnazione al tecnico': return 'bg-yellow-100 text-yellow-800 print:bg-white print:text-black';
      case 'In lavorazione': return 'bg-purple-100 text-purple-800 print:bg-white print:text-black';
      case 'Parti ordinate': return 'bg-orange-100 text-orange-800 print:bg-white print:text-black';
      case 'Pronto per il ritiro': return 'bg-green-100 text-green-800 print:bg-white print:text-black';
      case 'Chiuso': return 'bg-gray-100 text-gray-800 print:bg-white print:text-black';
      case 'Preventivo inviato': return 'bg-indigo-100 text-indigo-800 print:bg-white print:text-black';
      case 'Preventivo accettato': return 'bg-emerald-100 text-emerald-800 print:bg-white print:text-black';
      case 'Rifiutato': return 'bg-red-100 text-red-800 print:bg-white print:text-black';
      default: return 'bg-gray-100 text-gray-800 print:bg-white print:text-black';
    }
  }, [status]);

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
      {status}
    </span>
  );
}
