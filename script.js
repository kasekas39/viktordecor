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
        '.feature-card, .service-box, .portfolio-item-card, .testimonial-card, .section-header, .contact-info-block, .contact-form-block, .comment-form-card, .comments-feed-header'
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
    // 5. Contact & Booking Form (Supabase + Web3Forms Email)
    // ==========================================
    const quoteForm = document.getElementById('quote-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    const WEB3FORMS_ACCESS_KEY = '0fbefa65-2801-4c2f-a188-a1e1f735b786';

    if (quoteForm && submitBtn && formStatus) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('form-name');
            const phoneInput = document.getElementById('form-phone');
            const emailInput = document.getElementById('form-email');
            const serviceInput = document.getElementById('form-service');
            const messageInput = document.getElementById('form-message');

            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const service = serviceInput ? serviceInput.value : '';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!name || !phone || !email || !message) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please complete all required fields.';
                return;
            }

            // Disable button and show loading text
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending Request...</span>';
            formStatus.className = 'form-status';
            formStatus.textContent = '';

            try {
                // 1. Save booking lead into Supabase private bookings table
                const supabasePromise = fetch(`${SUPABASE_CONFIG.url}/rest/v1/bookings`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_CONFIG.anonKey,
                        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        name: name,
                        phone: phone,
                        email: email,
                        service: service,
                        message: message
                    })
                });

                // 2. Dispatch instant email alert to Viktor via Web3Forms
                const emailPromise = fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        subject: `🔔 New Consultation Request: ${name} (${service})`,
                        from_name: 'Viktor Decor Website',
                        name: name,
                        phone: phone,
                        email: email,
                        service: service,
                        message: message
                    })
                });

                const [supaRes, emailRes] = await Promise.allSettled([supabasePromise, emailPromise]);

                // Check if at least one service succeeded
                const supaSuccess = supaRes.status === 'fulfilled' && supaRes.value.ok;
                const emailSuccess = emailRes.status === 'fulfilled' && emailRes.value.ok;

                if (supaSuccess || emailSuccess) {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = `✓ Thank you, ${name}! Your consultation request has been received. Viktor will contact you within 24 hours.`;
                    quoteForm.reset();

                    // Fade out success message after 7 seconds
                    setTimeout(() => {
                        formStatus.style.transition = 'opacity 1s';
                        formStatus.style.opacity = '0';
                        setTimeout(() => {
                            formStatus.textContent = '';
                            formStatus.style.opacity = '1';
                        }, 1000);
                    }, 7000);
                } else {
                    throw new Error('Both database and email submissions failed');
                }
            } catch (err) {
                console.error('Booking submission error:', err);
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Unable to send online request. Please call Viktor directly on 07484 169695.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }

    // ==========================================
    // 6. Supabase Client Comments & Reviews System
    // ==========================================
    const SUPABASE_CONFIG = {
        url: 'https://vpdlversviqrypasthvl.supabase.co',
        anonKey: 'sb_publishable_eJLtCiXEW4pAiaSh5NHV2Q_pOAJOv1s'
    };

    const commentsList = document.getElementById('comments-list');
    const commentsCount = document.getElementById('comments-count');
    const commentForm = document.getElementById('comment-form');
    const commentSubmitBtn = document.getElementById('comment-submit-btn');
    const commentStatus = document.getElementById('comment-status');
    const refreshCommentsBtn = document.getElementById('refresh-comments-btn');

    // Rating Picker Elements
    const ratingPicker = document.getElementById('rating-picker');
    const starBtns = ratingPicker ? ratingPicker.querySelectorAll('.star-btn') : [];
    const ratingDisplay = document.getElementById('rating-display');
    const ratingInput = document.getElementById('comment-rating');
    let currentRating = 5;

    // Helper: Escape HTML to prevent XSS
    const escapeHtml = (unsafeStr) => {
        if (!unsafeStr) return '';
        return unsafeStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    // Helper: Monogram initials from name
    const getInitials = (name) => {
        if (!name) return 'V';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    };

    // Helper: Formatted human-readable date
    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Recently';
            
            const now = new Date();
            const diffSeconds = Math.floor((now - date) / 1000);

            if (diffSeconds < 60) return 'Just now';
            if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
            if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
            if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return 'Recently';
        }
    };

    // Rating Star Picker Interaction
    const updateStarUI = (rating) => {
        starBtns.forEach(btn => {
            const starVal = parseInt(btn.dataset.rating, 10);
            if (starVal <= rating) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        if (ratingDisplay) {
            ratingDisplay.textContent = `${rating} of 5 Stars`;
        }
    };

    if (starBtns.length > 0) {
        starBtns.forEach(btn => {
            // Hover preview
            btn.addEventListener('mouseenter', () => {
                const hoverVal = parseInt(btn.dataset.rating, 10);
                starBtns.forEach(b => {
                    const val = parseInt(b.dataset.rating, 10);
                    if (val <= hoverVal) {
                        b.classList.add('hovered');
                    } else {
                        b.classList.remove('hovered');
                    }
                });
            });

            // Reset hover preview on mouse leave
            btn.parentElement.addEventListener('mouseleave', () => {
                starBtns.forEach(b => b.classList.remove('hovered'));
            });

            // Click to lock rating
            btn.addEventListener('click', () => {
                currentRating = parseInt(btn.dataset.rating, 10);
                if (ratingInput) ratingInput.value = currentRating;
                updateStarUI(currentRating);
            });
        });
    }

    // Render comments list HTML
    const renderComments = (comments) => {
        if (!commentsList) return;

        if (commentsCount) {
            commentsCount.textContent = comments.length;
        }

        if (!comments || comments.length === 0) {
            commentsList.innerHTML = `
                <div class="comments-empty">
                    <div class="comments-empty-icon">💬</div>
                    <h4>No comments yet</h4>
                    <p>Be the first to share your experience with Viktor Painting & Decorating!</p>
                </div>
            `;
            return;
        }

        const itemsHtml = comments.map(comment => {
            const safeName = escapeHtml(comment.name || 'Anonymous');
            const safeMessage = escapeHtml(comment.message || '');
            const safeRating = Math.max(1, Math.min(5, parseInt(comment.rating, 10) || 5));
            const initials = getInitials(safeName);
            const dateStr = formatDate(comment.created_at);
            const starsText = '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);

            return `
                <article class="comment-item">
                    <div class="comment-item-top">
                        <div class="comment-item-author-box">
                            <div class="comment-avatar">${initials}</div>
                            <div class="comment-author-name">${safeName}</div>
                        </div>
                        <div class="comment-item-meta">
                            <span class="comment-stars" title="${safeRating} out of 5 stars">${starsText}</span>
                            <span class="comment-date">${dateStr}</span>
                        </div>
                    </div>
                    <p class="comment-item-message">${safeMessage}</p>
                </article>
            `;
        }).join('');

        commentsList.innerHTML = itemsHtml;
    };

    // Fetch comments from Supabase
    const fetchComments = async () => {
        if (!commentsList) return;

        try {
            const refreshIcon = refreshCommentsBtn ? refreshCommentsBtn.querySelector('.refresh-icon') : null;
            if (refreshIcon) refreshIcon.classList.add('spinning');

            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/comments?select=*&order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_CONFIG.anonKey,
                    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load comments (${response.status})`);
            }

            const data = await response.json();
            renderComments(data);
        } catch (error) {
            console.error('Supabase comments fetch error:', error);
            commentsList.innerHTML = `
                <div class="comments-empty">
                    <p style="color: #f87171;">Unable to load comments right now. Please refresh or try again later.</p>
                </div>
            `;
        } finally {
            const refreshIcon = refreshCommentsBtn ? refreshCommentsBtn.querySelector('.refresh-icon') : null;
            if (refreshIcon) {
                setTimeout(() => refreshIcon.classList.remove('spinning'), 400);
            }
        }
    };

    // Handle Comment Submission
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const authorInput = document.getElementById('comment-author');
            const messageInput = document.getElementById('comment-message');

            const name = authorInput ? authorInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';
            const rating = currentRating;

            if (!name || !message) {
                if (commentStatus) {
                    commentStatus.className = 'form-status error';
                    commentStatus.textContent = 'Please fill in your name and message.';
                }
                return;
            }

            // Disable submit button & show loading state
            if (commentSubmitBtn) {
                commentSubmitBtn.disabled = true;
                commentSubmitBtn.innerHTML = '<span>Posting...</span>';
            }
            if (commentStatus) {
                commentStatus.className = 'form-status';
                commentStatus.textContent = '';
            }

            try {
                const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/comments`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_CONFIG.anonKey,
                        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        name: name,
                        rating: rating,
                        message: message
                    })
                });

                if (!response.ok) {
                    throw new Error(`Post error: ${response.status}`);
                }

                // Success!
                if (commentStatus) {
                    commentStatus.className = 'form-status success';
                    commentStatus.textContent = '✓ Thank you! Your comment has been posted.';
                }

                // Reset inputs
                commentForm.reset();
                currentRating = 5;
                if (ratingInput) ratingInput.value = '5';
                updateStarUI(5);

                // Re-fetch comments to show the new one immediately
                await fetchComments();

                // Clear success message after 5 seconds
                setTimeout(() => {
                    if (commentStatus) {
                        commentStatus.style.transition = 'opacity 1s';
                        commentStatus.style.opacity = '0';
                        setTimeout(() => {
                            commentStatus.textContent = '';
                            commentStatus.style.opacity = '1';
                        }, 1000);
                    }
                }, 5000);

            } catch (err) {
                console.error('Failed to post comment:', err);
                if (commentStatus) {
                    commentStatus.className = 'form-status error';
                    commentStatus.textContent = 'Failed to post comment. Please try again.';
                }
            } finally {
                if (commentSubmitBtn) {
                    commentSubmitBtn.disabled = false;
                    commentSubmitBtn.innerHTML = '<span>Post Comment</span><span class="btn-arrow">→</span>';
                }
            }
        });
    }

    // Refresh button event listener
    if (refreshCommentsBtn) {
        refreshCommentsBtn.addEventListener('click', () => {
            fetchComments();
        });
    }

    // Initial load of comments
    fetchComments();
});
