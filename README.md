# FlashTicket 2.0 - Computer Repair Ticketing System

FlashTicket is a modern, responsive web application for managing computer repair tickets. It allows repair shops to track customer repairs, manage status updates, and communicate with customers efficiently.

## Features

- Create and manage repair tickets
- Track ticket status and priority
- Email notifications for new tickets and status changes
- Customer-facing public ticket view
- Multi-language support (English, Italian, German)
- Dark/light theme support
- Responsive design for all devices
- QR code generation for ticket sharing
- Printable ticket details

## Email Notification Setup

To enable email notifications, you need to set up a Supabase Edge Function:

1. Create a new Edge Function in your Supabase project called `send-email`
2. Upload the code from `supabase/functions/send-email/index.ts` to your Supabase project
3. Set environment variables in your Supabase project:
   - `FROM_EMAIL`: The email address to send from (e.g., `noreply@yourcompany.com`)
   - One of the following email service API keys:
     - `MAILERSEND_API_KEY`: API key for MailerSend (recommended)
     - `RESEND_API_KEY`: API key for Resend.com
     - `MAILGUN_API_KEY` and `MAILGUN_DOMAIN`: API key and domain for Mailgun
     - `SENDGRID_API_KEY`: API key for SendGrid

4. Deploy the Edge Function
5. In the FlashTicket application, go to Settings > Email Notifications and configure:
   - Admin Email Address: The email address to receive notifications
   - Enable/disable notification types as needed

## Technology Stack

- React with TypeScript
- Tailwind CSS for styling
- Supabase for backend and authentication
- Vite for development and building

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server: `npm run dev`

## Deployment

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `dist` directory to your hosting service
3. Ensure all routes redirect to `index.html` for client-side routing

## License

This project is proprietary software. All rights reserved.
