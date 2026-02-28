const { createClient } = require('@supabase/supabase-js');

async function testSupabase(url, key, label) {
    console.log(`--- Testing ${label} ---`);
    console.log(`URL: ${url}`);
    try {
        const supabase = createClient(url, key);
        const { data, error } = await supabase.from('portfolio_content').select('*').limit(1);
        if (error) {
            console.error(`Error fetching portfolio_content: ${error.message}`);
        } else {
            console.log(`Success! Found ${data.length} rows in portfolio_content.`);
        }

        const { data: projData, error: projError } = await supabase.from('projects').select('*').limit(1);
        if (projError) {
            console.error(`Error fetching projects: ${projError.message}`);
        } else {
            console.log(`Success! Found ${projData.length} rows in projects.`);
        }
    } catch (err) {
        console.error(`Unexpected error: ${err.message}`);
    }
    console.log("\n");
}

const CONFIG1 = {
    url: 'https://odklzxloviqmmldmrmes.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka2x6eGxvdmlxbW1sZG1ybWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIyODMsImV4cCI6MjA4NjA0ODI4M30.vJdUyT3_IrVrhne4_zndwuE2npj9VRewWgGT4JJ5DzY',
    label: 'Config in main.js/admin.html'
};

const CONFIG2 = {
    url: 'https://tcputuhmhbtdspxvmuaz.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHV0dWhtaGJ0ZHNweHZtdWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTM2OTgsImV4cCI6MjA4NTc4OTY5OH0.-vOEmDg0Ny0t54LAFRPrfdhUsHClYlUaObmL9YExZ6U',
    label: 'Config in test_supabase.js'
};

async function run() {
    await testSupabase(CONFIG1.url, CONFIG1.key, CONFIG1.label);
    await testSupabase(CONFIG2.url, CONFIG2.key, CONFIG2.label);
}

run();
