
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('Attempting to fetch health check...');
        // Try to fetch a simple thing, like the user session or just a public table count (if any)
        // Or just checking auth.getSession() which should be fast.
        const start = Date.now();
        const { data, error } = await supabase.from('manufacturers').select('count', { count: 'exact', head: true });

        const duration = Date.now() - start;
        console.log(`Request took ${duration}ms`);

        if (error) {
            console.error('Connection Error:', error.message);
            console.error('Supabase might be paused or unreachable.');
        } else {
            console.log('Connection Successful!');
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testConnection();
