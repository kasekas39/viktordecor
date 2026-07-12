document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Mobile Navigation Toggle
    // ==========================================
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileNavToggle && navMenu) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ==========================================
    // 2. Translucent Header on Scroll
    // ==========================================
    const header = document.querySelector('.main-header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once in case page loads scrolled

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Subtract half the header height to trigger early
            if (pageYOffset >= sectionTop - 120) {
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

    // ==========================================
    // 3. Before/After Interactive Sliders
    // ==========================================
    const sliders = document.querySelectorAll('.comparison-slider');

    sliders.forEach(slider => {
        let isDragging = false;

        const updateSlider = (e) => {
            const rect = slider.getBoundingClientRect();
            // Get clientX for either Touch or Mouse events
            let clientX = 0;
            if (e.type.startsWith('touch')) {
                if (e.touches && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                } else if (e.changedTouches && e.changedTouches.length > 0) {
                    clientX = e.changedTouches[0].clientX;
                }
            } else {
                clientX = e.clientX;
            }

            const x = clientX - rect.left;
            let percentage = (x / rect.width) * 100;
            
            // Constrain percentage between 0% and 100%
            percentage = Math.max(0, Math.min(percentage, 100));
            
            // Apply current percentage as custom CSS property
            slider.style.setProperty('--slider-pos', percentage + '%');
        };

        // Desktop Mouse Drag Events
        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateSlider(e);
            slider.classList.add('dragging');
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(e);
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                slider.classList.remove('dragging');
            }
        });

        // Mobile Touch Drag Events
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateSlider(e);
            slider.classList.add('dragging');
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSlider(e);
        }, { passive: true });

        window.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                slider.classList.remove('dragging');
            }
        });
    });

    // ==========================================
    // 4. Scroll Reveal Animations
    // ==========================================
    const itemsToReveal = document.querySelectorAll(
        '.feature-card, .service-box, .portfolio-item-card, .testimonial-card, .section-header, .contact-info-block, .contact-form-block, .giscus-wrapper'
    );
    
    // Add the reveal class dynamically to avoid layout shifting on initial render
    itemsToReveal.forEach(item => {
        item.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    itemsToReveal.forEach(item => {
        revealObserver.observe(item);
    });

    // ==========================================
    // 5. Contact Form Handling (Simulated Submit)
    // ==========================================
    const quoteForm = document.getElementById('quote-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if (quoteForm && submitBtn && formStatus) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Disable button and show loading text
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Processing Request...</span>';
            formStatus.className = 'form-status';
            formStatus.textContent = '';

            // Simulate API call delay
            setTimeout(() => {
                // Success action
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                
                formStatus.classList.add('success');
                formStatus.textContent = '✓ Thank you! Viktor will review your project and contact you within 24 hours.';
                
                // Clear the form fields
                quoteForm.reset();
                
                // Clear status message after 6 seconds
                setTimeout(() => {
                    formStatus.style.transition = 'opacity 1s';
                    formStatus.style.opacity = '0';
                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.style.opacity = '1';
                    }, 1000);
                }, 6000);

            }, 1800);
        });
    }
});
