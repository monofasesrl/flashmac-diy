# Setting up the Email Notification Edge Function

This guide will help you set up the Supabase Edge Function for email notifications in FlashTicket.

## Prerequisites

1. Supabase CLI installed (we've added it to the project dependencies)
2. Access to your Supabase project

## Steps to Deploy the Edge Function

1. **Login to Supabase CLI**

   ```bash
   npx supabase login
   ```

   This will open a browser window where you need to authorize the CLI.

2. **Deploy the Edge Function**

   ```bash
   npm run supabase:functions:deploy
   ```

   This will deploy the `send-email` function to your Supabase project.

3. **Set Environment Variables**

   After deploying, you need to set environment variables for your email service.
   Go to your Supabase dashboard:
   
   - Navigate to Edge Functions
   - Click on "Secrets" in the sidebar
   - Add the following secrets:

   ```
   FROM_EMAIL=noreply@yourcompany.com
   ```

   And at least one of these email service API keys:

   ```
   MAILERSEND_API_KEY=your_mailersend_api_key
   RESEND_API_KEY=your_resend_api_key
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

4. **Test the Function**

   After setting up the environment variables, go to the Settings page in FlashTicket and:
   
   - Enter an admin email address
   - Click "Send Test Email" to verify the function is working

## Troubleshooting

If you encounter issues:

1. Check the Edge Function logs in the Supabase dashboard
2. Verify your API keys are correct
3. Make sure the FROM_EMAIL is properly configured
4. Check that your email service account is active and properly set up

## Email Service Recommendations

We recommend using MailerSend as it has a generous free tier and is reliable. Alternatives include:

- Resend.com
- Mailgun
- SendGrid

Each service has its own setup requirements, so refer to their documentation for specific details.
