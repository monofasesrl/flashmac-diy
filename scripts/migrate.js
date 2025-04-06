import { initDb } from '../src/lib/db/index.js';

// Run migrations
console.log('Running migrations...');

async function runMigrations() {
  try {
    const db = await initDb();

    // Insert default settings
    db.exec(`
      INSERT OR REPLACE INTO settings (key, value)
      VALUES 
        ('terms_and_conditions', 'Default terms and conditions text. Please update this in the settings page.'),
        ('email_new_ticket', 'true'),
        ('email_status_change', 'true'),
        ('email_admin_address', ''),
        ('email_admin_old_tickets', 'true'),
        ('email_admin_old_tickets_days', '7'),
        ('wordpress_site_url', '')
    `);

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
