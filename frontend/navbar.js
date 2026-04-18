const navbar = document.querySelector('[data-navbar]');
const mobileMenuButton = document.querySelector('[data-mobile-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const navLinks = document.querySelectorAll('[data-nav-link]');

function initNavbar() {
    if (!navbar) return;

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    setupSmoothScroll();
    setupMobileMenu();
    setupActiveSectionHighlighting();
}

function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    if (scrollTop > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function setupSmoothScroll() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#' || !href.startsWith('#')) return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (!targetElement) return;
            
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            closeMobileMenu();
            
            history.pushState(null, null, href);
        });
    });
}

function setupMobileMenu() {
    if (!mobileMenuButton || !mobileMenu) return;
    
    mobileMenuButton.addEventListener('click', () => {
        const isClosed = mobileMenu.classList.contains('closed');
        
        if (isClosed) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    });
    
    mobileMenu.querySelectorAll('[data-nav-link]').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    document.addEventListener('click', (e) => {
        if (!mobileMenuButton?.contains(e.target) && !mobileMenu?.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function openMobileMenu() {
    mobileMenu.classList.remove('closed');
    mobileMenu.classList.add('open');
    mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
    mobileMenu.style.opacity = '1';
    mobileMenuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    if (!mobileMenu) return;
    
    mobileMenu.classList.remove('open');
    mobileMenu.classList.add('closed');
    mobileMenu.style.maxHeight = '0';
    mobileMenu.style.opacity = '0';
    mobileMenuButton?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function setupActiveSectionHighlighting() {
    const sections = document.querySelectorAll('[data-section]');
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                highlightNavLink(sectionId);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

function highlightNavLink(sectionId) {
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        const targetId = href.substring(1);
        
        if (targetId === sectionId) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

export function scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (!targetElement) return;
    
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    history.pushState(null, null, `#${sectionId}`);
    highlightNavLink(sectionId);
}

export function isMobileMenuOpen() {
    return mobileMenu ? mobileMenu.classList.contains('open') : false;
}

document.addEventListener('DOMContentLoaded', initNavbar);