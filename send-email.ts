// Follow this setup guide to integrate the Deno runtime into your Supabase project:
// https://supabase.com/docs/guides/functions/deno-runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY');
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN');
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
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

    // Try Resend if API key is available
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

    // Try Mailgun if API key is available and Resend failed
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
