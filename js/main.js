// Main JavaScript file

// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://tcputuhmhbtdspxvmuaz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHV0dWhtaGJ0ZHNweHZtdWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTM2OTgsImV4cCI6MjA4NTc4OTY5OH0.-vOEmDg0Ny0t54LAFRPrfdhUsHClYlUaObmL9YExZ6U';
let supabase = null;

if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const loadDynamicContent = async () => {
    const { data: allContent } = await supabase.from('portfolio_content').select('*');

    if (allContent) {
        allContent.forEach(item => {
            const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;

            if (item.section_name === 'hero') {
                if (content.subtitle) document.querySelector('.hero .subtitle').innerText = content.subtitle;
                if (content.description) document.querySelector('.hero .description').innerText = content.description;
                if (content.profile_url) document.querySelector('.profile-pic').src = content.profile_url;
            }

            else if (item.section_name === 'education' && content.raw) {
                const container = document.querySelector('#education .cv-grid');
                if (container) {
                    container.innerHTML = content.raw.split('\n').map(line => {
                        const parts = line.split('|').map(s => s.trim());
                        return `<div class="cv-item">
                            <span class="cv-date">${parts[0] || ''}</span>
                            <h3>${parts[1] || ''}</h3>
                            <p class="cv-org">${parts[2] || ''}</p>
                            <p class="cv-meta">${parts[3] || ''}</p>
                        </div>`;
                    }).join('');
                }
            }

            else if (item.section_name === 'experience' && content.raw) {
                const container = document.querySelector('#experience .cv-grid');
                if (container) {
                    container.innerHTML = content.raw.split('\n').map(line => {
                        const parts = line.split('|').map(s => s.trim());
                        return `<div class="cv-item">
                            <span class="cv-date">${parts[0] || ''}</span>
                            <h3>${parts[1] || ''}</h3>
                            <p class="cv-org">${parts[2] || ''}</p>
                            <ul class="cv-details">
                                ${parts[3] ? parts[3].split(';').map(p => `<li>${p.trim()}</li>`).join('') : ''}
                            </ul>
                        </div>`;
                    }).join('');
                }
            }

            else if (item.section_name === 'activities' && content.raw) {
                const container = document.querySelector('#activities .cv-grid');
                if (container) {
                    container.innerHTML = content.raw.split('\n').map(line => {
                        const parts = line.split('|').map(s => s.trim());
                        return `<div class="cv-item">
                            <h3>${parts[0] || ''}</h3>
                            <p class="cv-org">${parts[1] || ''}</p>
                            <p>${parts[2] || ''}</p>
                        </div>`;
                    }).join('');
                }
            }

            else if (item.section_name === 'skills_awards') {
                if (content.skills) {
                    const skillContainer = document.querySelector('.skills-column .skills-grid');
                    if (skillContainer) skillContainer.innerHTML = content.skills.split(',').map(s => `<div class="skill-item">${s.trim()}</div>`).join('');
                }
                if (content.awards) {
                    const awardContainer = document.querySelector('.awards-column .cv-details');
                    if (awardContainer) awardContainer.innerHTML = content.awards.split('\n').map(a => `<li>${a.trim()}</li>`).join('');
                }
            }

            else if (item.section_name === 'contact') {
                const contactText = document.querySelector('.contact-text');
                if (contactText) {
                    contactText.innerHTML = `Chittagong, Bangladesh<br>Phone: ${content.phone || ''}<br>Email: ${content.email || ''}`;
                }
                const link = document.querySelector('.contact .btn-primary');
                if (link) link.href = `mailto:${content.email}`;
                const li = document.querySelector('.social-links a');
                if (li) li.href = content.linkedin || '#';
            }
        });
    }

    // 2. Load Projects
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading projects:', error);
        return;
    }

    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid && projects.length > 0) {
        projectGrid.innerHTML = ''; // Clear placeholders
        projects.forEach(project => {
            const projectCard = `
                <article class="project-card">
                    <div class="project-image">
                        <img src="${project.image_url || 'assets/placeholder.png'}" alt="${project.title}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-tech">
                            ${project.tech_stack ? project.tech_stack.map(tech => `<span>${tech}</span>`).join('') : ''}
                        </div>
                        <div class="project-links">
                            ${project.github_link ? `<a href="${project.github_link}" target="_blank" aria-label="GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>` : ''}
                            ${project.live_link ? `<a href="${project.live_link}" target="_blank" aria-label="External Link"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>` : ''}
                        </div>
                    </div>
                </article>`;
            projectGrid.innerHTML += projectCard;
        });
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch dynamic content if Supabase is connected
    if (supabase) {
        loadDynamicContent();
    }

    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Header scroll background effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Theme Toggle (if implemented)
    // Add logic here for light/dark mode if requested
});
