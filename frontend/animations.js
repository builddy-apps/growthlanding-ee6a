const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function initTypewriter(selector = '[data-typewriter]', options = {}) {
    const element = document.querySelector(selector);
    if (!element) return;

    const text = element.dataset.text || element.innerText;
    if (!text) return;

    const { speed = 50, delay = 0 } = options;
    element.textContent = '';

    if (PREFERS_REDUCED_MOTION) {
        element.textContent = text;
        return;
    }

    setTimeout(() => {
        let index = 0;
        const typeChar = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeChar, speed);
            }
        };
        typeChar();
    }, delay);
}

export function initStatCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const targetValue = parseFloat(el.dataset.counter);
            const duration = 2000;
            const startTime = performance.now();
            const startValue = 0;
            const isFloat = !Number.isInteger(targetValue);

            el.textContent = '0';

            if (PREFERS_REDUCED_MOTION) {
                el.textContent = targetValue.toLocaleString();
                observer.unobserve(el);
                return;
            }

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutExpo(progress);

                const currentValue = startValue + (targetValue - startValue) * easedProgress;
                
                el.textContent = isFloat 
                    ? currentValue.toFixed(1) 
                    : Math.floor(currentValue).toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = targetValue.toLocaleString();
                }
            };

            requestAnimationFrame(animate);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

export function initScrollAnimations() {
    const singleReveals = document.querySelectorAll('[data-reveal]');
    const staggerGroups = document.querySelectorAll('[data-reveal-group]');

    // Setup individual reveal elements
    singleReveals.forEach(el => {
        el.classList.add('opacity-0', 'transition-opacity', 'transition-transform', 'duration-700', 'ease-out');
        const offset = el.dataset.revealOffset || '8';
        el.classList.add(`translate-y-${offset}`);
    });

    // Setup staggered groups
    staggerGroups.forEach(group => {
        const items = group.children;
        const baseDelay = parseInt(group.dataset.revealStagger) || 100;
        
        Array.from(items).forEach((item, index) => {
            item.classList.add('opacity-0', 'transition-opacity', 'transition-transform', 'duration-700', 'ease-out');
            const offset = item.dataset.revealOffset || '8';
            item.classList.add(`translate-y-${offset}`);
            item.dataset.revealDelay = index * baseDelay;
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.dataset.revealDelay || 0);
                const offset = el.dataset.revealOffset || '8';

                const animateIn = () => {
                    el.classList.remove('opacity-0', `translate-y-${offset}`);
                    el.classList.add('opacity-100', 'translate-y-0');
                };

                if (PREFERS_REDUCED_MOTION) {
                    animateIn();
                } else {
                    setTimeout(animateIn, delay);
                }

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    singleReveals.forEach(el => observer.observe(el));
    staggerGroups.forEach(group => {
        Array.from(group.children).forEach(child => observer.observe(child));
    });
}

export function initAnimations() {
    initTypewriter('[data-typewriter]', { speed: 50, delay: 500 });
    initStatCounters();
    initScrollAnimations();
}