import { apiGet } from './app.js';

const SAMPLE_TESTIMONIALS = [
    {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Marketing Director',
        company: 'TechFlow Inc.',
        quote: 'GrowthLanding transformed our conversion rates overnight. The intuitive interface and powerful features helped us increase our leads by 150% in just three months.',
        avatar_url: null,
        rating: 5
    },
    {
        id: 2,
        name: 'Michael Chen',
        role: 'CEO',
        company: 'StartupScale',
        quote: 'We\'ve tried dozens of landing page builders, but nothing compares to GrowthLanding. The results speak for themselves - our ROI has never been higher.',
        avatar_url: null,
        rating: 5
    },
    {
        id: 3,
        name: 'Emily Rodriguez',
        role: 'Product Manager',
        company: 'InnovateLab',
        quote: 'The ease of use combined with the powerful analytics features makes GrowthLanding the perfect solution for our growing team. Highly recommended!',
        avatar_url: null,
        rating: 5
    }
];

class TestimonialsCarousel {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        this.track = this.container.querySelector('[data-testimonials-track]');
        this.prevButton = this.container.querySelector('[data-testimonials-prev]');
        this.nextButton = this.container.querySelector('[data-testimonials-next]');
        this.dotsContainer = this.container.querySelector('[data-testimonials-dots]');
        
        this.testimonials = [];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isPlaying = true;
        
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    async init() {
        await this.fetchTestimonials();
        this.render();
        this.setupEventListeners();
        this.startAutoPlay();
    }
    
    async fetchTestimonials() {
        try {
            const response = await apiGet('/api/testimonials?featured=true&limit=10');
            if (response.success && response.data && response.data.length > 0) {
                this.testimonials = response.data;
                return;
            }
        } catch (error) {
            console.warn('Failed to fetch testimonials from API, using fallback data:', error.message);
        }
        
        this.testimonials = SAMPLE_TESTIMONIALS;
    }
    
    render() {
        if (!this.track || this.testimonials.length === 0) return;
        
        this.track.innerHTML = '';
        if (this.dotsContainer) this.dotsContainer.innerHTML = '';
        
        this.testimonials.forEach((testimonial, index) => {
            const card = this.createTestimonialCard(testimonial, index);
            this.track.appendChild(card);
        });
        
        if (this.dotsContainer) {
            this.testimonials.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-primary-500 w-8' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'}`;
                dot.setAttribute('data-testimonials-dot', index);
                dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
                this.dotsContainer.appendChild(dot);
            });
        }
        
        this.updateCarousel();
    }
    
    createTestimonialCard(testimonial, index) {
        const card = document.createElement('div');
        card.className = 'flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4';
        
        const avatarInitial = testimonial.name ? testimonial.name.charAt(0).toUpperCase() : 'U';
        const avatarBg = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'][index % 5];
        
        const ratingStars = Array(5).fill(0).map((_, i) => `
            <svg class="w-5 h-5 ${i < (testimonial.rating || 5) ? 'text-amber-400 fill-current' : 'text-slate-300 dark:text-slate-600'}" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
        `).join('');
        
        card.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-14 h-14 ${avatarBg} rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        ${avatarInitial}
                    </div>
                    <div>
                        <h4 class="font-semibold text-slate-900 dark:text-white">${escapeHtml(testimonial.name || 'Anonymous')}</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400">${escapeHtml(testimonial.role || '')}${testimonial.company ? `, ${escapeHtml(testimonial.company)}` : ''}</p>
                    </div>
                </div>
                <div class="flex gap-1 mb-4">
                    ${ratingStars}
                </div>
                <blockquote class="flex-grow text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "${escapeHtml(testimonial.quote)}"
                </blockquote>
            </div>
        `;
        
        return card;
    }
    
    setupEventListeners() {
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.previous());
        }
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.next());
        }
        
        if (this.dotsContainer) {
            this.dotsContainer.querySelectorAll('[data-testimonials-dot]').forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
        }
        
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
        
        this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        this.container.setAttribute('tabindex', '0');
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previous();
            if (e.key === 'ArrowRight') this.next();
        });
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }
    
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.previous();
            }
        }
    }
    
    updateCarousel() {
        if (!this.track || !this.track.children[0]) return;
        
        const slideWidth = this.track.children[0].offsetWidth;
        const gap = 16;
        const scrollPosition = this.currentIndex * (slideWidth + gap);
        
        this.track.style.transform = `translateX(-${scrollPosition}px)`;
        this.track.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        
        if (this.dotsContainer) {
            this.dotsContainer.querySelectorAll('[data-testimonials-dot]').forEach((dot, index) => {
                dot.className = index === this.currentIndex 
                    ? 'w-8 h-3 rounded-full bg-primary-500 transition-all duration-300'
                    : 'w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 transition-all duration-300';
            });
        }
        
        if (this.prevButton) {
            this.prevButton.disabled = this.currentIndex === 0;
            this.prevButton.classList.toggle('opacity-50', this.currentIndex === 0);
            this.prevButton.classList.toggle('cursor-not-allowed', this.currentIndex === 0);
        }
        if (this.nextButton) {
            this.nextButton.disabled = this.currentIndex >= this.testimonials.length - 1;
            this.nextButton.classList.toggle('opacity-50', this.currentIndex >= this.testimonials.length - 1);
            this.nextButton.classList.toggle('cursor-not-allowed', this.currentIndex >= this.testimonials.length - 1);
        }
    }
    
    next() {
        if (this.currentIndex >= this.testimonials.length - 1) {
            this.currentIndex = 0;
        } else {
            this.currentIndex++;
        }
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    previous() {
        if (this.currentIndex <= 0) {
            this.currentIndex = this.testimonials.length - 1;
        } else {
            this.currentIndex--;
        }
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.testimonials.length) return;
        this.currentIndex = index;
        this.updateCarousel();
        this.resetAutoPlay();
    }
    
    startAutoPlay() {
        if (this.autoPlayInterval) return;
        this.autoPlayInterval = setInterval(() => this.next(), 5000);
        this.isPlaying = true;
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            this.isPlaying = false;
        }
    }
    
    resumeAutoPlay() {
        if (!this.isPlaying) {
            this.startAutoPlay();
        }
    }
    
    resetAutoPlay() {
        this.pauseAutoPlay();
        this.startAutoPlay();
    }
    
    destroy() {
        this.pauseAutoPlay();
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function initTestimonialsCarousel() {
    return new TestimonialsCarousel('[data-testimonials-carousel]');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialsCarousel);
} else {
    initTestimonialsCarousel();
}

export default TestimonialsCarousel;