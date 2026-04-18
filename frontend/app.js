// Dark Mode Management
const DARK_MODE_KEY = 'growthLanding_darkMode';

export function initDarkMode() {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'true' || (stored === null && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

export function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(DARK_MODE_KEY, isDark.toString());
    return isDark;
}

// Toast Notification System
let toastContainer = null;

function createToastContainer() {
    if (toastContainer) return;
    
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
}

export function showToast(message, type = 'info', duration = 5000) {
    createToastContainer();
    
    const toast = document.createElement('div');
    const icons = {
        success: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
        error: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
        info: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };
    
    const colors = {
        success: 'bg-emerald-500 text-white shadow-emerald-500/30',
        error: 'bg-red-500 text-white shadow-red-500/30',
        info: 'bg-blue-500 text-white shadow-blue-500/30'
    };
    
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${colors[type]}`;
    toast.innerHTML = `
        ${icons[type]}
        <span class="font-medium text-sm">${escapeHtml(message)}</span>
        <button class="ml-2 opacity-70 hover:opacity-100 transition-opacity" aria-label="Close">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;
    
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => dismissToast(toast));
    
    toastContainer.appendChild(toast);
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });
    });
    
    const timeout = setTimeout(() => dismissToast(toast), duration);
    
    toast.addEventListener('mouseenter', () => clearTimeout(timeout));
    toast.addEventListener('mouseleave', () => {
        setTimeout(() => dismissToast(toast), duration);
    });
}

function dismissToast(toast) {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 300);
}

// API Helpers
export async function apiGet(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error(`API GET ${url} error:`, error);
        throw error;
    }
}

export async function apiPost(url, data, options = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            ...options
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || `Request failed with status ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error(`API POST ${url} error:`, error);
        throw error;
    }
}

// Utility Functions
export function isValidEmail(email) {
    if (typeof email !== 'string' || email.length === 0) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

export function serializeFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Shared State Management
const listeners = new Map();
const state = new Proxy({}, {
    set(target, key, value) {
        const oldValue = target[key];
        target[key] = value;
        notifyListeners(key, value, oldValue);
        return true;
    }
});

export function setState(key, value) {
    state[key] = value;
}

export function getState(key, defaultValue = undefined) {
    return state[key] !== undefined ? state[key] : defaultValue;
}

export function subscribe(key, callback) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set());
    }
    listeners.get(key).add(callback);
    
    return () => {
        const callbacks = listeners.get(key);
        if (callbacks) {
            callbacks.delete(callback);
        }
    };
}

function notifyListeners(key, newValue, oldValue) {
    const callbacks = listeners.get(key);
    if (callbacks) {
        callbacks.forEach(callback => {
            try {
                callback(newValue, oldValue);
            } catch (error) {
                console.error(`State listener error for key "${key}":`, error);
            }
        });
    }
}

// Initialize dark mode immediately
initDarkMode();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem(DARK_MODE_KEY) === null) {
        if (e.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});