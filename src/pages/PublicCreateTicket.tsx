import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbOps } from '../lib/db';
import { useI18n } from '../lib/i18n/context';
import { supabase } from '../lib/supabase';
import PhoneInput from 'react-phone-input-2';
import { v4 as uuidv4 } from 'uuid';
import 'react-phone-input-2/lib/style.css';

export function PublicCreateTicket() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    description: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '+39',
    device_type: '',
    purchase_date: '',
    order_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadError, setUploadError] = useState('');

  // Initialize and load logo URL
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize DB connection with authentication
        await dbOps.initDb();
        
        // Load logo URL
        const url = await dbOps.getSetting('logo_url');
        if (url) setLogoUrl(url);
      } catch (error) {
        console.error('Error initializing:', error);
        setError('Error initializing application');
      } finally {
        setInitializing(false);
      }
    };
    
    initialize();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file types
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
      const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        setUploadError('Solo immagini (JPG, PNG, GIF, WebP) e video (MP4, MOV, WebM) sono supportati.');
        return;
      }
      
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = newFiles.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        setUploadError('I file devono essere inferiori a 10MB.');
        return;
      }
      
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setUploadError('');
      
      // Reset the input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async (ticketId: string): Promise<string[]> => {
    if (files.length === 0) return [];
    
    const fileUrls: string[] = [];
    const newProgress = { ...uploadProgress };
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${ticketId}/${uuidv4()}.${fileExt}`;
      const filePath = `ticket-attachments/${fileName}`;
      
      try {
        // Fix: Removed onUploadProgress and use standard upload
        const { error } = await supabase.storage
          .from('tickets')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) throw error;
        
        // Update progress manually since we can't use onUploadProgress
        newProgress[file.name] = 100;
        setUploadProgress(newProgress);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('tickets')
          .getPublicUrl(filePath);
        
        fileUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Errore durante il caricamento del file ${file.name}`);
      }
    }
    
    return fileUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadError('');
    
    try {
      // Ensure we have authentication
      await dbOps.initDb();
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;
      
      if (!userId) {
        throw new Error("Authentication failed. Please refresh the page and try again.");
      }

      const { id } = await dbOps.createTicket({
        description: formData.description,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        device_type: formData.device_type,
        purchase_date: formData.purchase_date,
        order_id: formData.order_id,
        priority: 'low', // Always set to low for public tickets
        status: 'Ticket inserito',
        user_id: userId
      });

      // Upload files if any
      if (files.length > 0) {
        try {
          const fileUrls = await uploadFiles(id);
          
          // Store file URLs in the ticket_attachments table
          if (fileUrls.length > 0) {
            const attachments = fileUrls.map(url => ({
              ticket_id: id,
              file_url: url,
              file_type: url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
              uploaded_at: new Date().toISOString()
            }));
            
            const { error } = await supabase
              .from('ticket_attachments')
              .insert(attachments);
            
            if (error) throw error;
          }
        } catch (uploadError) {
          console.error('Error with file uploads:', uploadError);
          // Continue with redirect even if uploads fail
        }
      }

      // Redirect to thank you page
      navigate(`/public/tickets/thank-you/${id}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError(t('tickets.messages.createError') + error);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `
    mt-1 block w-full rounded-lg border-0 bg-white/5 
    text-white shadow-sm ring-1 ring-inset ring-white/10 
    focus:ring-2 focus:ring-inset focus:ring-purple-500
    sm:text-sm sm:leading-6
  `;

  const labelClasses = "block text-sm font-medium text-gray-200";

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        {logoUrl && (
          <div className="flex justify-center mb-8">
            <img 
              src={logoUrl} 
              alt="Company Logo" 
              className="h-16 object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🖥️</text></svg>';
              }}
            />
          </div>
        )}

        <div className="bg-gray-800/50 p-8 rounded-lg shadow-xl backdrop-blur-sm ring-1 ring-white/10">
          <h1 className="text-2xl font-semibold mb-6 text-white text-center">
            {t('tickets.createNew')}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg ring-1 ring-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    inputClass="!w-full !bg-white/5 !text-white !border-0 !ring-1 !ring-inset !ring-white/10 focus:!ring-2 focus:!ring-inset focus:!ring-purple-500"
                    buttonClass="!bg-white/5 !border-0 !ring-1 !ring-inset !ring-white/10"
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
                <label className={labelClasses}>{t('tickets.purchaseDate')}</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className={inputClasses}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                />
              </div>

              <div>
                <label className={labelClasses}>{t('tickets.orderId')}</label>
                <input
                  type="text"
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  className={inputClasses}
                  placeholder={t('tickets.orderIdPlaceholder')}
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className={labelClasses}>Foto o Video (opzionale)</label>
              <div className="mt-1">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Clicca per caricare</span> o trascina qui
                      </p>
                      <p className="text-xs text-gray-400">
                        Immagini (JPG, PNG, GIF, WebP) o Video (MP4, MOV, WebM) - Max 10MB
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
                      onChange={handleFileChange}
                      multiple
                    />
                  </label>
                </div>
                
                {uploadError && (
                  <p className="mt-2 text-sm text-red-400">{uploadError}</p>
                )}
                
                {/* File Preview */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-300">File selezionati:</p>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-300 truncate max-w-xs">
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              ></path>
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent 
                rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 
                hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-purple-500 transition-all duration-200 
                hover:shadow-lg hover:shadow-purple-500/20
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : t('tickets.actions.create')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
