# Configurazione delle Notifiche Email per FlashTicket

Questa guida ti aiuterà a configurare le notifiche email per la tua applicazione FlashTicket utilizzando le Supabase Edge Functions.

## Prerequisiti

- Un account Supabase con accesso al tuo progetto
- Un account con un provider di servizi email (MailerSend, Resend, Mailgun o SendGrid)

## Passo 1: Creare la Edge Function in Supabase

1. Accedi alla dashboard di Supabase
2. Naviga al tuo progetto
3. Vai a "Edge Functions" nella barra laterale sinistra
4. Clicca su "Create a new function"
5. Nomina la funzione `send-email`
6. Copia il codice qui sotto e incollalo nell'editor della funzione:

```typescript
// Follow this setup guide to integrate the Deno runtime into your Supabase project:
// https://supabase.com/docs/guides/functions/deno-runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY');
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN');
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const MAILERSEND_API_KEY = Deno.env.get('MAILERSEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@flashmac.com';

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    // Parse request body
    const { to, subject, body } = await req.json() as EmailRequest;

    // Validate required fields
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, body' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Try to send email using available service
    let sent = false;
    let error = null;

    // Try MailerSend if API key is available
    if (MAILERSEND_API_KEY && !sent) {
      try {
        const response = await fetch('https://api.mailersend.com/v1/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: {
              email: FROM_EMAIL,
            },
            to: [
              {
                email: to,
              },
            ],
            subject: subject,
            html: body,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          sent = true;
          console.log('Email sent via MailerSend');
        } else {
          error = `MailerSend error: ${JSON.stringify(result)}`;
          console.error(error);
        }
      } catch (e) {
        error = `MailerSend exception: ${e.message}`;
        console.error(error);
      }
    }

    // Try Resend if API key is available and MailerSend failed
    if (RESEND_API_KEY && !sent) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to,
            subject,
            html: body,
          }),
        });

        const result = await response.json();
        
        if (response.ok && result.id) {
          sent = true;
          console.log```typescript
          console.log('Email sent via Resend:', result.id);
        } else {
          error = `Resend error: ${JSON.stringify(result)}`;
          console.error(error);
        }
      } catch (e) {
        error = `Resend exception: ${e.message}`;
        console.error(error);
      }
    }

    // Try Mailgun if API key is available and other methods failed
    if (MAILGUN_API_KEY && MAILGUN_DOMAIN && !sent) {
      try {
        const response = await fetch(
          `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              from: FROM_EMAIL,
              to,
              subject,
              html: body,
            }).toString(),
          }
        );

        const result = await response.json();
        
        if (response.ok && result.id) {
          sent = true;
          console.log('Email sent via Mailgun:', result.id);
        } else {
          error = `Mailgun error: ${JSON.stringify(result)}`;
          console.error(error);
        }
      } catch (e) {
        error = `Mailgun exception: ${e.message}`;
        console.error(error);
      }
    }

    // Try SendGrid if API key is available and other methods failed
    if (SENDGRID_API_KEY && !sent) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: FROM_EMAIL },
            subject,
            content: [{ type: 'text/html', value: body }],
          }),
        });
        
        if (response.ok) {
          sent = true;
          console.log('Email sent via SendGrid');
        } else {
          const result = await response.text();
          error = `SendGrid error: ${result}`;
          console.error(error);
        }
      } catch (e) {
        error = `SendGrid exception: ${e.message}`;
        console.error(error);
      }
    }

    // Return response based on whether email was sent
    if (sent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to send email', 
          error: error || 'No email service configured' 
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

7. Clicca su "Deploy Function"

## Passo 2: Impostare le Variabili d'Ambiente

1. Nella dashboard di Supabase, vai a "Edge Functions"
2. Clicca sulla funzione "send-email"
3. Clicca su "Secrets" nella barra laterale
4. Aggiungi i seguenti segreti:

```
FROM_EMAIL=noreply@tuaazienda.com
```

E almeno una di queste chiavi API per servizi email:

```
MAILERSEND_API_KEY=la_tua_chiave_api_mailersend
RESEND_API_KEY=la_tua_chiave_api_resend
MAILGUN_API_KEY=la_tua_chiave_api_mailgun
MAILGUN_DOMAIN=il_tuo_dominio_mailgun
SENDGRID_API_KEY=la_tua_chiave_api_sendgrid
```

## Passo 3: Configurare FlashTicket

1. Nella tua applicazione FlashTicket, vai alla pagina Impostazioni
2. Sotto "Notifiche Email", inserisci il tuo indirizzo email amministratore
3. Abilita i tipi di notifica che desideri ricevere
4. Clicca su "Salva Impostazioni"
5. Clicca su "Invia Email di Test" per verificare che tutto funzioni correttamente

## Risoluzione dei problemi

Se riscontri problemi:

1. Controlla i log della Edge Function nella dashboard di Supabase
2. Verifica che le tue chiavi API siano corrette
3. Assicurati che FROM_EMAIL sia configurato correttamente
4. Controlla che il tuo account del servizio email sia attivo e configurato correttamente

## Raccomandazioni sui Servizi Email

Raccomandiamo di utilizzare MailerSend poiché ha un generoso piano gratuito ed è affidabile. Le alternative includono:

- Resend.com
- Mailgun
- SendGrid

Ogni servizio ha i propri requisiti di configurazione, quindi consulta la loro documentazione per dettagli specifici.
