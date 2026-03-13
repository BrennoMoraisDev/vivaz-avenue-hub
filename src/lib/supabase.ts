import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = 'https://okmuhustvzkbwxsfemxn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rbXVodXN0dnprYnd4c2ZlbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE0MjksImV4cCI6MjA4ODkzNzQyOX0.ERe2dfP6-_B-zC4e5Ev1aoK26pV_n1n01sMPPn00J7U';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
