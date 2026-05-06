import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aiagjtktbvficyujbmkd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpYWdqdGt0YnZmaWN5dWpibWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzI4OTYsImV4cCI6MjA5MzYwODg5Nn0.gkyA4NsTswPcTfV-_T2NI7xmrxgnr4GDSL8ZM2RUtg8";

export const supabase = createClient(supabaseUrl, supabaseKey);