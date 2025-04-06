import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../src/lib/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigrations() {
  console.log('Applying migrations to Supabase...');
  
  try {
    // Get the migration directory
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    
    // Read all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations are applied in order
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      
      // Read the SQL content
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
      
      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      }
      
      console.log(`Successfully applied migration: ${file}`);
    }
    
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

applyMigrations();
