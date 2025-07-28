// Main JavaScript file for Elegant Fashion

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initializeImageGallery();
    initializeProductFilters();
    initializeScrollEffects();
    initializeFormValidation();
    initializeNavigation();
});

// Image Gallery Functionality
function initializeImageGallery() {
    // Lightbox functionality for product images
    const productImages = document.querySelectorAll('.product-image, #mainProductImage');
    
    productImages.forEach(img => {
        img.addEventListener('click', function() {
            if (this.dataset.bsToggle === 'modal') {
                return; // Let Bootstrap handle modal images
            }
            
            // Create lightbox overlay
            const lightbox = createLightbox(this.src, this.alt);
            document.body.appendChild(lightbox);
            
            // Show with animation
            setTimeout(() => {
                lightbox.classList.add('show');
            }, 10);
        });
    });
}

function createLightbox(imageSrc, imageAlt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <img src="${imageSrc}" alt="${imageAlt}" class="lightbox-image">
        </div>
    `;
    
    // Add styles
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // Close functionality
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            closeLightbox(lightbox);
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox(lightbox);
        }
    });
    
    return lightbox;
}

function closeLightbox(lightbox) {
    lightbox.classList.remove('show');
    setTimeout(() => {
        if (lightbox.parentNode) {
            lightbox.parentNode.removeChild(lightbox);
        }
    }, 300);
}

// Product Filtering
function initializeProductFilters() {
    const sortSelect = document.querySelector('select');
    const sizeButtons = document.querySelectorAll('.btn-outline-secondary');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
    
    // Size filter functionality
    sizeButtons.forEach(button => {
        if (button.textContent.match(/^(XS|S|M|L|XL|\d+)$/)) {
            button.addEventListener('click', function() {
                toggleSizeFilter(this);
            });
        }
    });
}

function sortProducts(sortBy) {
    const productGrid = document.querySelector('.row.g-4');
    if (!productGrid) return;
    
    const products = Array.from(productGrid.children);
    
    products.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.text-primary').textContent.replace('$', ''));
        const priceB = parseFloat(b.querySelector('.text-primary').textContent.replace('$', ''));
        
        switch(sortBy) {
            case 'Price: Low to High':
                return priceA - priceB;
            case 'Price: High to Low':
                return priceB - priceA;
            case 'Newest':
                // Assuming featured items are newer
                const featuredA = a.querySelector('.badge');
                const featuredB = b.querySelector('.badge');
                if (featuredA && !featuredB) return -1;
                if (!featuredA && featuredB) return 1;
                return 0;
            default:
                return 0;
        }
    });
    
    // Reorder DOM elements
    products.forEach(product => {
        productGrid.appendChild(product);
    });
    
    // Add animation
    products.forEach((product, index) => {
        product.style.opacity = '0';
        product.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            product.style.transition = 'all 0.3s ease';
            product.style.opacity = '1';
            product.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function toggleSizeFilter(button) {
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        button.classList.remove('btn-outline-secondary');
        button.classList.add('btn-primary');
    } else {
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline-secondary');
    }
    
    // Filter products based on selected sizes
    filterProductsBySize();
}

function filterProductsBySize() {
    const activeSizes = Array.from(document.querySelectorAll('.btn.active'))
        .map(btn => btn.textContent.trim());
    
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productLink = card.querySelector('a[href*="product"]');
        if (productLink) {
            // Show all products if no sizes selected
            if (activeSizes.length === 0) {
                card.style.display = 'block';
            } else {
                // This would require product data to filter properly
                // For now, just show all products
                card.style.display = 'block';
            }
        }
    });
}

// Scroll Effects
function initializeScrollEffects() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
    
    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll('.card, .category-card, .value-card, .team-card');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(this)) {
                showSuccessMessage();
                this.reset();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Remove existing error styling
    field.classList.remove('is-invalid');
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required.';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address.';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid phone number.';
        }
    }
    
    // Show error if invalid
    if (!isValid) {
        field.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

function showSuccessMessage() {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        <strong>Success!</strong> Your message has been sent. We'll get back to you soon.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// Navigation Enhancement
function initializeNavigation() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Active navigation highlighting
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Utility Functions
function debounce(func, wait) {
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

// Search functionality (if search is implemented)
function initializeSearch() {
    const searchInput = document.querySelector('input[type="search"]');
    if (!searchInput) return;
    
    const debouncedSearch = debounce(performSearch, 300);
    
    searchInput.addEventListener('input', function() {
        debouncedSearch(this.value);
    });
}

function performSearch(query) {
    if (query.length < 2) return;
    
    // This would typically make an API call to search products
    console.log('Searching for:', query);
    
    // For now, just filter visible products
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.card-title').textContent.toLowerCase();
        const productDescription = card.querySelector('.card-text').textContent.toLowerCase();
        
        if (productName.includes(query.toLowerCase()) || 
            productDescription.includes(query.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Initialize search if element exists
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});

// Add loading states for dynamic content
function showLoading(element) {
    element.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
}

function hideLoading(element, content) {
    element.innerHTML = content;
}

// Export functions for use in other scripts
window.ElegantFashion = {
    createLightbox,
    closeLightbox,
    sortProducts,
    validateForm,
    showSuccessMessage,
    debounce
};
