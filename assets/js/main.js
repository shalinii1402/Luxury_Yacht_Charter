document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    // Reveal Animations on Scroll
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('mobile-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Profile Dropdown Toggle
    const profileToggle = document.getElementById('profile-toggle');
    const profileMenu = document.getElementById('profile-menu');

    if (profileToggle && profileMenu) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileToggle.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('active');
            }
        });
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Fleet Filtering Logic
    const typeFilter = document.getElementById('typeFilter');
    const guestFilter = document.getElementById('guestFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');
    const yachtCards = document.querySelectorAll('.yacht-card');
    const catCards = document.querySelectorAll('.cat-filter-card');
    const resultsCount = document.getElementById('resultsCount');

    // Only run if on fleet page
    if (typeFilter && yachtCards.length > 0) {

        // Pagination Variables
        const itemsPerPage = 6;
        let currentPage = 1;
        let filteredCards = []; // Store currently filtered cards

        function filterYachts() {
            const typeValue = typeFilter.value;
            const guestValue = guestFilter.value;
            const minP = minPrice.value ? parseInt(minPrice.value) : 0;
            const maxP = maxPrice.value ? parseInt(maxPrice.value) : Infinity;

            // Reset filtered list
            filteredCards = [];

            yachtCards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                const cardGuests = parseInt(card.getAttribute('data-guests'));
                const cardPrice = parseInt(card.getAttribute('data-price'));

                let isVisible = true;

                // Type Check
                if (typeValue !== 'all' && cardType !== typeValue) {
                    isVisible = false;
                }

                // Guest Check (Simplified logic)
                if (guestValue !== 'any') {
                    if (guestValue === '6' && cardGuests > 6) isVisible = false; // 1-6
                    if (guestValue === '12' && (cardGuests <= 6 || cardGuests > 12)) isVisible = false; // 6-12
                    if (guestValue === '13' && cardGuests <= 12) isVisible = false; // 12+
                }

                // Price Check
                if (cardPrice < minP || cardPrice > maxP) {
                    isVisible = false;
                }

                if (isVisible) {
                    filteredCards.push(card);
                }
            });

            // Update Count
            if (resultsCount) {
                resultsCount.textContent = `Showing ${filteredCards.length} Yacht${filteredCards.length !== 1 ? 's' : ''}`;
            }

            // Update Visual Filter State
            catCards.forEach(card => {
                card.classList.toggle('active', card.getAttribute('data-filter') === typeValue);
            });

            // Reset to Page 1 on filter change
            currentPage = 1;
            renderPagination();
        }

        function renderPagination() {
            // Hide all cards first
            yachtCards.forEach(card => {
                card.style.display = 'none';
                card.classList.remove('active');
            });

            // Calculate pagination bounds
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedItems = filteredCards.slice(startIndex, endIndex);

            // Show current page items
            paginatedItems.forEach(card => {
                card.style.display = 'block';
                // Small delay to allow display:block to apply before opacity transition
                setTimeout(() => card.classList.add('active'), 10);
            });

            // Update Pagination UI
            updatePaginationControls();
        }

        function updatePaginationControls() {
            const paginationContainer = document.querySelector('.pagination');
            if (!paginationContainer) return;

            const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
            let paginationHTML = '';

            // Previous Button (optional, but good for UX)
            // paginationHTML += `<a href="#" data-page="prev" class="${currentPage === 1 ? 'disabled' : ''}"><i class="fas fa-chevron-left"></i></a>`;

            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `<a href="#" data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</a>`;
            }

            // Next Button
            if (totalPages > 1) {
                paginationHTML += `<a href="#" data-page="next" class="${currentPage === totalPages ? 'disabled' : ''}"><i class="fas fa-chevron-right"></i></a>`;
            }

            paginationContainer.innerHTML = paginationHTML;

            // Add Click Listeners
            paginationContainer.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageData = link.getAttribute('data-page');

                    if (pageData === 'prev') {
                        if (currentPage > 1) currentPage--;
                    } else if (pageData === 'next') {
                        if (currentPage < totalPages) currentPage++;
                    } else {
                        currentPage = parseInt(pageData);
                    }

                    renderPagination();
                    // Scroll to top of grid
                    const gridTop = document.querySelector('.fleet-toolbar');
                    if (gridTop) gridTop.scrollIntoView({ behavior: 'smooth' });
                });
            });
        }

        // Initial Run
        filterYachts();

        // Event Listeners
        if (applyBtn) applyBtn.addEventListener('click', filterYachts);

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                typeFilter.value = 'all';
                guestFilter.value = 'any';
                minPrice.value = '';
                maxPrice.value = '';
                filterYachts();
            });
        }

        // Live filtering for selects
        typeFilter.addEventListener('change', filterYachts);
        guestFilter.addEventListener('change', filterYachts);

        // Visual Filter click
        catCards.forEach(card => {
            card.addEventListener('click', () => {
                const filterType = card.getAttribute('data-filter');
                typeFilter.value = filterType;
                filterYachts();
            });
        });
    }

    // Scroll to Top
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
