import { apiPost, showToast, isValidEmail, debounce } from './app.js';

const NEWSLETTER_API = '/api/newsletter';
const CONTACT_API = '/api/contact';

function updateInputValidation(input, isValid) {
    if (!input) return;
    
    input.classList.remove('border-green-500', 'border-red-500', 'focus:border-green-500', 'focus:border-red-500');
    
    if (isValid === true) {
        input.classList.add('border-green-500', 'focus:border-green-500');
    } else if (isValid === false) {
        input.classList.add('border-red-500', 'focus:border-red-500');
    }
}

function setFormLoading(form, isLoading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    if (isLoading) {
        if (form.dataset.submitting === 'true') return;
        
        form.dataset.submitting = 'true';
        const originalContent = submitBtn.innerHTML;
        form.dataset.originalButtonContent = originalContent;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
        `;
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        form.querySelectorAll('input, textarea').forEach(el => el.disabled = true);
    } else {
        form.dataset.submitting = 'false';
        const originalContent = form.dataset.originalButtonContent;
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        form.querySelectorAll('input, textarea').forEach(el => el.disabled = false);
    }
}

function handleNewsletterForm(form) {
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;

    emailInput.addEventListener('input', debounce(() => {
        const value = emailInput.value.trim();
        if (value.length === 0) {
            updateInputValidation(emailInput, null);
        } else if (isValidEmail(value)) {
            updateInputValidation(emailInput, true);
        } else {
            updateInputValidation(emailInput, false);
        }
    }, 300));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (form.dataset.submitting === 'true') return;

        const email = emailInput.value.trim();
        
        if (!email || !isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            updateInputValidation(emailInput, false);
            emailInput.focus();
            return;
        }

        setFormLoading(form, true);

        try {
            await apiPost(NEWSLETTER_API, { email });
            showToast('Successfully subscribed to newsletter!', 'success');
            form.reset();
            updateInputValidation(emailInput, null);
        } catch (error) {
            showToast(error.message || 'Failed to subscribe. Please try again.', 'error');
        } finally {
            setFormLoading(form, false);
        }
    });
}

function handleContactForm(form) {
    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const messageInput = form.querySelector('textarea[name="message"]');

    if (!nameInput || !emailInput || !messageInput) return;

    emailInput.addEventListener('input', debounce(() => {
        const value = emailInput.value.trim();
        if (value.length === 0) {
            updateInputValidation(emailInput, null);
        } else if (isValidEmail(value)) {
            updateInputValidation(emailInput, true);
        } else {
            updateInputValidation(emailInput, false);
        }
    }, 300));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (form.dataset.submitting === 'true') return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        let hasError = false;

        if (name.length < 2) {
            showToast('Name must be at least 2 characters', 'error');
            nameInput.focus();
            hasError = true;
        }

        if (!email || !isValidEmail(email)) {
            if (!hasError) {
                showToast('Please enter a valid email address', 'error');
                emailInput.focus();
            }
            updateInputValidation(emailInput, false);
            hasError = true;
        }

        if (message.length < 10) {
            if (!hasError) {
                showToast('Message must be at least 10 characters', 'error');
                messageInput.focus();
            }
            hasError = true;
        }

        if (hasError) return;

        setFormLoading(form, true);

        try {
            await apiPost(CONTACT_API, { name, email, message });
            showToast('Message sent successfully! We\'ll be in touch soon.', 'success');
            form.reset();
            updateInputValidation(emailInput, null);
        } catch (error) {
            showToast(error.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            setFormLoading(form, false);
        }
    });
}

export function initForms() {
    const newsletterForms = document.querySelectorAll('[data-newsletter-form]');
    newsletterForms.forEach(form => handleNewsletterForm(form));

    const contactForms = document.querySelectorAll('[data-contact-form]');
    contactForms.forEach(form => handleContactForm(form));
}