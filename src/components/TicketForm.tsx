import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbOps } from '../lib/db';
import type { Ticket } from '../types';
import { useI18n } from '../lib/i18n/context';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export function TicketForm() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '+39',
    device_type: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'Ticket inserito' as Ticket['status'],
    price: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert(t('tickets.messages.signInRequired'));
      return;
    }

    try {
      await dbOps.createTicket({
        description: formData.description,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        device_type: formData.device_type,
        priority: formData.priority,
        status: formData.status,
        price: formData.price ? parseFloat(formData.price) : null,
        password: formData.password || undefined,
        user_id: userId
      });

      alert(t('tickets.messages.createSuccess'));
      navigate('/tickets');
    } catch (error) {
      alert(t('tickets.messages.createError') + error);
      console.error(error);
    }
  };

  const inputClasses = `
    mt-1 block w-full rounded-lg border-0 bg-gray-800/50 
    text-white shadow-sm ring-1 ring-inset ring-gray-700 
    placeholder:text-gray-400 
    focus:ring-2 focus:ring-inset focus:ring-purple-500
    hover:ring-gray-600
    transition-shadow duration-200
  `;

  const labelClasses = "block text-sm font-medium text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 p-6 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-gray-800/50">
      <div>
        <label className={labelClasses}>{t('tickets.description')}</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`${inputClasses} min-h-[100px]`}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelClasses}>{t('tickets.customerName')}</label>
          <input
            type="text"
            required
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>{t('tickets.customerEmail')}</label>
          <input
            type="email"
            required
            value={formData.customer_email}
            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelClasses}>{t('tickets.customerPhone')}</label>
          <div className="mt-1">
            <PhoneInput
              country="it"
              value={formData.customer_phone}
              onChange={(phone) => setFormData({ ...formData, customer_phone: '+' + phone })}
              inputClass="!w-full !bg-gray-800/50 !text-white !border-0 !ring-1 !ring-inset !ring-gray-700 focus:!ring-2 focus:!ring-inset focus:!ring-purple-500"
              buttonClass="!bg-gray-800/50 !border-0 !ring-1 !ring-inset !ring-gray-700"
              dropdownClass="!bg-gray-800 !text-white"
              containerClass="!bg-transparent"
              searchClass="!bg-gray-800 !text-white"
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>{t('tickets.deviceType')}</label>
          <input
            type="text"
            required
            value={formData.device_type}
            onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelClasses}>{t('tickets.price')}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>{t('tickets.priority.label')}</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
            className={inputClasses}
          >
            <option value="low">{t('tickets.priority.low')}</option>
            <option value="medium">{t('tickets.priority.medium')}</option>
            <option value="high">{t('tickets.priority.high')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}>{t('tickets.password')}</label>
        <input
          type="text"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Device password (optional)"
          className={inputClasses}
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent 
          rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 
          hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
          focus:ring-purple-500 transition-all duration-200 
          hover:shadow-lg hover:shadow-purple-500/20"
      >
        {t('tickets.actions.create')}
      </button>
    </form>
  );
}
