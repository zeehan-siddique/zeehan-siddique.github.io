// Main JavaScript file

// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://odklzxloviqmmldmrmes.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ka2x6eGxvdmlxbW1sZG1ybWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIyODMsImV4cCI6MjA4NjA0ODI4M30.vJdUyT3_IrVrhne4_zndwuE2npj9VRewWgGT4JJ5DzY';
let supabaseClient = null;

const initSupabase = () => {
    // Try to get Supabase from window object
    const _supabase = window.supabase;

    if (_supabase && _supabase.createClient) {
        supabaseClient = _supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase Client Initialized via window.supabase");
    } else {
        console.error("Supabase library not found! Check your internet connection.");
        // alert("Error: Supabase library failed to load. Please refresh.");
    }
};

const loadDynamicContent = async () => {
    if (!supabaseClient) return;

    console.log("Fetching content from Supabase...");
    try {
        const { data: allContent, error } = await supabaseClient.from('portfolio_content').select('*');

        if (error) {
            console.error("Supabase Select Error:", error.message);
            return;
        }

        if (!allContent || allContent.length === 0) {
            console.warn("No content found in portfolio_content table.");
            return;
        }

        console.log(`Loaded ${allContent.length} sections from database.`);

        allContent.forEach(item => {
            const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;

            if (item.section_name === 'hero') {
                console.log("Updating Hero section...");
                if (content.name) document.querySelector('.hero .headline').innerText = content.name;
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
                    const certMap = {
                        'Mechanical Intern': 'assets/gph_internship.png'
                    };
                    container.innerHTML = content.raw.split('\n').map(line => {
                        const parts = line.split('|').map(s => s.trim());
                        let h3Content = parts[1] || '';

                        // Handle explicit {assets/path.png} format
                        if (h3Content.includes('{')) {
                            const [title, cert] = h3Content.split('{').map(s => s.replace('}', '').trim());
                            h3Content = `<span class="cert-link" data-cert="${cert}">${title}</span>`;
                        }
                        // Fallback mapping for known items
                        else if (certMap[h3Content]) {
                            h3Content = `<span class="cert-link" data-cert="${certMap[h3Content]}">${h3Content}</span>`;
                        }

                        return `<div class="cv-item">
                            <span class="cv-date">${parts[0] || ''}</span>
                            <h3>${h3Content}</h3>
                            <p class="cv-org">${parts[2] || ''}</p>
                            <ul class="cv-details">
                                ${parts[3] ? parts[3].split(';').map(p => {
                            let liContent = p.trim();
                            if (liContent.includes('{')) {
                                const [text, cert] = liContent.split('{').map(s => s.replace('}', '').trim());
                                return `<li class="cert-link" data-cert="${cert}">${text}</li>`;
                            }
                            return `<li>${liContent}</li>`;
                        }).join('') : ''}
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
                    const certMap = {
                        'CSWA Certification for SolidWorks': 'assets/cswa.png',
                        'University Rover Challenge 2025 Award': 'assets/urc_2025.jpg',
                        'University Rover Challenge 2025': 'assets/urc_2025.jpg',
                        'AUST Rover Challenge 2.0 (ARC 2.0) Award': 'assets/arc_2_0.png'
                    };

                    if (awardContainer) awardContainer.innerHTML = content.awards.split('\n').map(a => {
                        let text = a.trim();
                        // Handle explicit {assets/path.png} format
                        if (text.includes('{')) {
                            const [name, cert] = text.split('{').map(s => s.replace('}', '').trim());
                            return `<li class="cert-link" data-cert="${cert}">${name}</li>`;
                        }
                        // Fallback mapping for known items
                        for (let key in certMap) {
                            if (text.includes(key)) {
                                return `<li class="cert-link" data-cert="${certMap[key]}">${text}</li>`;
                            }
                        }
                        return `<li>${text}</li>`;
                    }).join('');
                }
            }

            else if (item.section_name === 'contact') {
                const contactText = document.querySelector('.contact-text');
                if (contactText) {
                    contactText.innerHTML = `Chittagong, Bangladesh<br>Phone: ${content.phone || ''}<br>Email: ${content.email || ''}`;
                }
                const waBtn = document.querySelector('.contact-btn-wa');
                if (waBtn && content.phone) {
                    const cleanPhone = content.phone.replace(/\D/g, '');
                    waBtn.href = `https://wa.me/${cleanPhone}`;
                }
                const mailBtn = document.querySelector('.contact-btn-mail');
                if (mailBtn && content.email) mailBtn.href = `mailto:${content.email}`;

                const linkedinLink = document.querySelector('.contact-linkedin');
                if (linkedinLink) linkedinLink.href = content.linkedin || '#';

                const grabcadLink = document.querySelector('.contact-grabcad');
                if (grabcadLink) grabcadLink.href = content.grabcad || '#';
            }

            else if (item.section_name === 'settings') {
                if (content.theme) {
                    document.documentElement.setAttribute('data-theme', content.theme);
                    localStorage.setItem('site-theme', content.theme);
                    console.log(`Applied theme: ${content.theme}`);
                }

                // Update Logo
                if (content.logoText || content.logoUrl) {
                    const logo = document.querySelector('.logo');
                    if (logo) {
                        let logoContent = '';
                        if (content.logoUrl) {
                            logoContent += `<img src="${content.logoUrl}" alt="Logo" style="height: 32px; width: 32px; margin-right: 12px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);">`;
                        }
                        if (content.logoText) {
                            logoContent += content.logoText;
                        }
                        logo.innerHTML = logoContent;
                    }
                }

                // Update Social Icons
                if (content.icons) {
                    const linkedinLink = document.querySelector('.contact-linkedin');
                    if (linkedinLink && content.icons.linkedin) {
                        linkedinLink.innerHTML = content.icons.linkedin;
                    }

                    const grabcadLink = document.querySelector('.contact-grabcad');
                    if (grabcadLink && content.icons.grabcad) {
                        grabcadLink.innerHTML = content.icons.grabcad;
                    }
                }
            }
        });

        // Smoothly reveal content once loaded
        document.querySelector('.hero-content').classList.add('content-loaded');

        console.log(`Updated sections: ${count}`);
    } catch (err) {
        console.error("Error in loadDynamicContent:", err);
    }
};

window.debugSupabase = async () => {
    if (!supabaseClient) {
        alert("Backend is currently DISABLED as requested.");
        return;
    }
    try {
        const { data, error } = await supabaseClient.from('portfolio_content').select('*');
        if (error) {
            alert(`Supabase Error: ${error.message}`);
        } else {
            const sections = data.map(d => d.section_name).join(', ');
            alert(`Found ${data.length} rows in database: ${sections}\nCheck console for details.`);
            console.log("Database Data:", data);
        }
    } catch (err) {
        alert(`Request Failed: ${err.message}`);
    }
};

// 2. Load Projects
const loadProjects = async () => {
    if (!supabaseClient) return;

    try {
        const { data: projects, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading projects:', error);
            return;
        }

        const projectGrid = document.querySelector('.project-grid');
        if (projectGrid) {
            if (projects.length === 0) {
                projectGrid.innerHTML = '<p style="text-align:center; color:var(--text-secondary); width: 100%;">More projects coming soon!</p>';
                return;
            }

            projectGrid.innerHTML = ''; // Clear loading
            projects.forEach(project => {
                const projectCard = `
                        <article class="project-card">
                            <div class="project-image">
                                <img src="${project.image_url || 'assets/placeholder.png'}" alt="${project.title}">
                            </div>
                            <div class="project-info">
                                <h3>${project.title}</h3>
                                <p>${project.description || ''}</p>
                                <div class="project-links">
                                    ${project.link_url ? `<a href="${project.link_url}" target="_blank" class="btn btn-outline" style="width:100%; text-align:center;">View Project</a>` : ''}
                                </div>
                            </div>
                        </article>`;
                projectGrid.innerHTML += projectCard;
            });
        }
    } catch (err) {
        console.error("Error in loadProjects:", err);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase
    initSupabase();

    // Fetch dynamic content if Supabase is connected
    if (supabaseClient) {
        await Promise.all([loadDynamicContent(), loadProjects()]);
    }

    // Mobile Navigation Toggle

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

    // Certificate Modal Logic
    const certModal = document.getElementById('cert-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');
    const modalOverlay = document.querySelector('.modal-overlay');

    if (certModal && modalImg) {
        document.addEventListener('click', (e) => {
            const certLink = e.target.closest('.cert-link');
            if (certLink) {
                const certSrc = certLink.getAttribute('data-cert');
                if (certSrc) {
                    modalImg.src = certSrc;
                    certModal.style.display = 'flex';
                    setTimeout(() => {
                        certModal.classList.add('active');
                    }, 10);
                    document.body.style.overflow = 'hidden';
                }
            }
        });

        const closeCertModal = () => {
            if (!certModal.classList.contains('active')) return;
            certModal.classList.remove('active');
            setTimeout(() => {
                certModal.style.display = 'none';
                modalImg.src = '';
            }, 300);
            document.body.style.overflow = 'auto';
        };

        if (closeModal) closeModal.addEventListener('click', closeCertModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeCertModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCertModal();
        });
    }
});
