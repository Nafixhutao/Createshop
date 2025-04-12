import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgmdafrxsukviljhzcyi.supabase.co'
const supabaseAnonKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbWRhZnJ4c3Vrdmlsamh6Y3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NjU1NjIsImV4cCI6MjA2MDA0MTU2Mn0.leRWbeaWInHHDOq1FTQgej30lZFk8HuZDqZbiacpMDg`

export const supabase = createClient(supabaseUrl, supabaseAnonKey);