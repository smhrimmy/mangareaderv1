import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://mztozufmxdukkknhcaka.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dG96dWZteGR1a2trbmhjYWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NzA2OTgsImV4cCI6MjA4MjM0NjY5OH0.bE5ovQXlbLdycpuTWmNafmzNOWpningwsjil99XHBH0";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("Missing Supabase credentials");
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Keep-Alive Mechanism
// Pings the database every 5 minutes to prevent pausing on free tier
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const keepAlive = async () => {
  try {
    // A lightweight query to keep the connection active
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) console.error("Keep-alive ping failed:", error.message);
    else console.log("Supabase keep-alive ping successful");
  } catch (err) {
    console.error("Keep-alive error:", err);
  }
};

// Start the interval if we are in a browser environment
if (typeof window !== 'undefined') {
  setInterval(keepAlive, KEEP_ALIVE_INTERVAL);
  // Initial ping
  keepAlive();
}
