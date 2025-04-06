import { Ticket } from '../types';
import { useI18n } from '../lib/i18n/context';

interface StatusSelectProps {
  value: Ticket['status'];
  onChange: (value: Ticket['status']) => void;
  className?: string;
}

export function StatusSelect({ value, onChange, className = '' }: StatusSelectProps) {
  const { t } = useI18n();
  const statuses: Ticket['status'][] = [
    'Ticket inserito',
    'In assegnazione al tecnico',
    'In lavorazione',
    'Parti ordinate',
    'Preventivo inviato',
    'Preventivo accettato',
    'Rifiutato',
    'Pronto per il ritiro',
    'Chiuso'
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Ticket['status'])}
      className={className}
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {t(`tickets.status.${status}`)}
        </option>
      ))}
    </select>
  );
}
