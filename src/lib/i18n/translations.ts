// Only Italian translations
const italianTranslations = {
  auth: {
    signIn: 'Accedi',
    signUp: 'Registrati',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Password dimenticata?',
    continueWith: 'Oppure continua con',
    checkEmail: 'Controlla la tua email per il link di accesso!'
  },
  tickets: {
    createNew: 'Crea Nuovo Ticket',
    createNewDescription: 'Crea un nuovo ticket di riparazione per un cliente',
    viewAll: 'Visualizza Tutti i Ticket',
    viewAllDescription: 'Visualizza e gestisci tutti i ticket di riparazione',
    allTickets: 'Tutti i Ticket',
    recentTickets: 'Ticket Recenti',
    title: 'Titolo',
    description: 'Descrizione',
    customerName: 'Nome Cliente',
    customerEmail: 'Email Cliente',
    customerPhone: 'Numero di Telefono',
    deviceType: 'Tipo Dispositivo',
    price: 'Prezzo',
    password: 'Password Dispositivo',
    purchaseDate: 'Data di Acquisto',
    orderId: 'ID Ordine (opzionale)',
    orderIdPlaceholder: 'Inserisci il tuo ID ordine se disponibile',
    priority: {
      label: 'Priorità',
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
      all: 'Tutte le Priorità'
    },
    status: {
      label: 'Stato',
      'Ticket inserito': 'Ticket inserito',
      'In assegnazione al tecnico': 'In assegnazione al tecnico',
      'In lavorazione': 'In lavorazione',
      'Parti ordinate': 'Parti ordinate',
      'Pronto per il ritiro': 'Pronto per il ritiro',
      'Chiuso': 'Chiuso',
      'Preventivo inviato': 'Preventivo inviato',
      'Preventivo accettato': 'Preventivo accettato',
      'Rifiutato': 'Rifiutato',
      'allStatuses': 'Tutti gli Stati'
    },
    actions: {
      create: 'Crea Ticket',
      edit: 'Modifica',
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      print: 'Stampa',
      viewDetail: 'Visualizza Dettaglio',
      createAnother: 'Crea un altro ticket'
    },
    messages: {
      createSuccess: 'Ticket creato con successo',
      createError: 'Errore durante la creazione del ticket: ',
      updateError: 'Errore durante l\'aggiornamento del ticket: ',
      deleteConfirm: 'Sei sicuro di voler eliminare questo ticket?',
      signInRequired: 'Effettua l\'accesso per creare un ticket',
      thankYou: 'Grazie!',
      ticketCreated: 'Il tuo ticket di riparazione è stato creato con successo. Il tuo numero di ticket è:',
      createAnother: 'Crea un altro ticket'
    },
    search: 'Cerca tickets...',
    sort: {
      date: 'Ordina per Data',
      priority: 'Ordina per Priorità'
    },
    contact: {
      email: 'Contatta via Email',
      whatsapp: 'Contatta via WhatsApp'
    },
    detail: {
      title: 'Ticket di Riparazione',
      createdBy: 'Creato da',
      created: 'Creato il',
      lastUpdated: 'Ultimo aggiornamento',
      status: 'Stato',
      priority: 'Priorità',
      customerInfo: 'Informazioni Cliente',
      name: 'Nome',
      email: 'Email',
      deviceInfo: 'Informazioni Dispositivo',
      deviceType: 'Tipo Dispositivo',
      price: 'Prezzo',
      password: 'Password Dispositivo',
      description: 'Descrizione',
      termsAndConditions: 'Termini e Condizioni',
      customerSignature: 'Firma Cliente',
      date: 'Data',
      signHere: 'Firma qui'
    },
    assignTo: 'Assegna a',
    assignedTo: 'Assegnato a',
    unassigned: 'Non assegnato'
  },
  common: {
    signOut: 'Esci',
    loading: 'Caricamento...',
    scanForTicketDetails: 'Scansiona per dettagli ticket',
    loggedInAs: 'Accesso come'
  },
  settings: {
    title: 'Impostazioni',
    logo: {
      title: 'Impostazioni Logo',
      url: 'URL Logo',
      urlPlaceholder: 'https://esempio.com/logo.png',
      description: 'Inserisci l\'URL del logo della tua azienda',
      preview: 'Anteprima Logo',
      saveButton: 'Salva URL Logo',
      saving: 'Salvataggio...',
      success: 'URL del logo aggiornato con successo',
      error: 'Impossibile caricare l\'URL del logo',
      loadError: 'Impossibile caricare il logo dall\'URL fornito. Controlla l\'URL e riprova.'
    },
    email: {
      title: 'Notifiche Email',
      adminEmail: 'Indirizzo Email Amministratore',
      newTicket: 'Invia email quando viene creato un nuovo ticket',
      statusChange: 'Invia email quando cambia lo stato del ticket',
      oldTickets: 'Notifica all\'amministratore i ticket vecchi',
      daysBeforeNotification: 'Giorni prima della notifica',
      saveButton: 'Salva Impostazioni',
      saving: 'Salvataggio...',
      success: 'Impostazioni email aggiornate con successo',
      error: 'Impossibile caricare le impostazioni email',
      testButton: 'Invia Email di Prova',
      testSuccess: 'Email di prova inviata con successo!',
      testError: 'Impossibile inviare l\'email di prova',
      checkOldTickets: 'Controlla Ticket Vecchi Ora',
      setupInstructions: 'Configurazione Notifiche Email',
      setupDescription: 'Per abilitare le notifiche email, devi configurare una Edge Function di Supabase:',
      setupSteps: {
        createFunction: 'Crea una nuova Edge Function nel tuo progetto Supabase chiamata',
        useService: 'Utilizza un servizio come SendGrid, Mailgun o Resend per inviare email',
        configureFunction: 'Configura la Edge Function per inviare email utilizzando il servizio preferito',
        setAdminEmail: 'Imposta l\'indirizzo email dell\'amministratore sopra per ricevere le notifiche'
      }
    },
    terms: {
      title: 'Termini e Condizioni',
      text: 'Testo Termini e Condizioni',
      description: 'Questo testo apparirà sui ticket di riparazione stampati',
      saveButton: 'Salva Termini',
      saving: 'Salvataggio...',
      success: 'Termini e condizioni aggiornati con successo',
      error: 'Impossibile caricare i termini e condizioni'
    }
  }
};

export const translations = italianTranslations;
