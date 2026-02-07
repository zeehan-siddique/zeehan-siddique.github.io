const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://tcputuhmhbtdspxvmuaz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHV0dWhtaGJ0ZHNweHZtdWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTM2OTgsImV4cCI6MjA4NTc4OTY5OH0.-vOEmDg0Ny0t54LAFRPrfdhUsHClYlUaObmL9YExZ6U';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    console.log("Fetching portfolio_content...");
    const { data, error } = await supabase.from('portfolio_content').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data found:", data.length, "rows");
        data.forEach(row => {
            console.log(`- ${row.section_name}:`, JSON.stringify(row.content).substring(0, 100));
        });
    }
}

test();
