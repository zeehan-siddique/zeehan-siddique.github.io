const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://tcputuhmhbtdspxvmuaz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHV0dWhtaGJ0ZHNweHZtdWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTM2OTgsImV4cCI6MjA4NTc4OTY5OH0.-vOEmDg0Ny0t54LAFRPrfdhUsHClYlUaObmL9YExZ6U';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const certs = [
    { name: 'cswa.png', local: 'e:/github io/assets/cswa.png' },
    { name: 'urc_2025.jpg', local: 'e:/github io/assets/urc_2025.jpg' },
    { name: 'arc_2_0.png', local: 'e:/github io/assets/arc_2_0.png' },
    { name: 'gph_internship.png', local: 'e:/github io/assets/gph_internship.png' }
];

async function run() {
    const publicUrls = {};

    for (const cert of certs) {
        console.log(`Uploading ${cert.name}...`);
        const fileBuffer = fs.readFileSync(cert.local);

        const { data, error } = await supabase.storage
            .from('project-images')
            .upload(`certs/${cert.name}`, fileBuffer, {
                upsert: true,
                contentType: cert.name.endsWith('.png') ? 'image/png' : 'image/jpeg'
            });

        if (error) {
            console.error(`Error uploading ${cert.name}:`, error.message);
            continue;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(`certs/${cert.name}`);

        publicUrls[cert.name] = publicUrl;
        console.log(`Uploaded ${cert.name} to ${publicUrl}`);
    }

    // Now update the database
    console.log('Updating database content...');

    // 1. Update Experience
    const { data: expData } = await supabase.from('portfolio_content').select('*').eq('section_name', 'experience').single();
    if (expData) {
        let raw = expData.content.raw || "";
        raw = raw.replace(/Mechanical Intern(\s*\{.*?\})?/g, `Mechanical Intern {${publicUrls['gph_internship.png']}}`);
        await supabase.from('portfolio_content').upsert({ section_name: 'experience', content: { ...expData.content, raw } });
        console.log('Experience updated.');
    }

    // 2. Update Skills & Awards
    const { data: saData } = await supabase.from('portfolio_content').select('*').eq('section_name', 'skills_awards').single();
    if (saData) {
        let awards = saData.content.awards || "";
        awards = awards.replace(/CSWA Certification for SolidWorks(\s*\{.*?\})?/g, `CSWA Certification for SolidWorks {${publicUrls['cswa.png']}}`);
        awards = awards.replace(/University Rover Challenge 2025 Award(\s*\{.*?\})?/g, `University Rover Challenge 2025 (The Mars Society) {${publicUrls['urc_2025.jpg']}}`);
        awards = awards.replace(/University Rover Challenge 2025(\s*\{.*?\})?/g, `University Rover Challenge 2025 (The Mars Society) {${publicUrls['urc_2025.jpg']}}`);

        if (!awards.includes('ARC 2.0') && !awards.includes('AUST Rover Challenge')) {
            awards += `\nAUST Rover Challenge 2.0 (ARC 2.0) Award {${publicUrls['arc_2_0.png']}}`;
        } else {
            awards = awards.replace(/AUST Rover Challenge 2.0 \(ARC 2.0\) Award(\s*\{.*?\})?/g, `AUST Rover Challenge 2.0 (ARC 2.0) Award {${publicUrls['arc_2_0.png']}}`);
        }

        await supabase.from('portfolio_content').upsert({ section_name: 'skills_awards', content: { ...saData.content, awards } });
        console.log('Skills & Awards updated.');
    }

    console.log('Done!');
}

run().catch(console.error);
