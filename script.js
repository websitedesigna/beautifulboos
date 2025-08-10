// Global Variables
let cart = [];
let currentCustomization = {
    product: '',
    basePrice: 0,
    text: '',
    color: '#ff6b9d',
    image: null,
    glitter: [],
    hasLidStraw: false
};

// DOM Elements
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartContent = document.getElementById('cart-content');
const cartItems = document.getElementById('cart-items');
const emptyCart = document.getElementById('empty-cart');
const cartFooter = document.getElementById('cart-footer');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const continueShoppingBtn = document.getElementById('continue-shopping');
const checkoutBtn = document.getElementById('checkout-btn');
const successMessage = document.getElementById('success-message');

// Customizer Elements
const customizerContainer = document.getElementById('customizer-container');
const closeCustomizer = document.getElementById('close-customizer');
const customText = document.getElementById('custom-text');
const customImage = document.getElementById('custom-image');
const previewItem = document.getElementById('preview-item');
const previewText = document.getElementById('preview-text');
const previewImage = document.getElementById('preview-image');
const previewTitle = document.getElementById('preview-title');
const basePrice = document.getElementById('base-price');
const textPriceLine = document.getElementById('text-price-line');
const addonPriceLine = document.getElementById('addon-price-line');
const totalPrice = document.getElementById('total-price');
const addCustomToCart = document.getElementById('add-custom-to-cart');
const glitterOptions = document.getElementById('glitter-options');
const lidStrawOptions = document.getElementById('lid-straw-options');
const lidStrawAddon = document.getElementById('lid-straw-addon');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateCartDisplay();
    initializeProductFilters();
    initializeMobileMenu();
    scrollToSection('home');

});

// Event Listeners
function initializeEventListeners() {
    // Cart Modal
    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);
    cartOverlay.addEventListener('click', closeCartModal);
    continueShoppingBtn.addEventListener('click', closeCartModal);
    checkoutBtn.addEventListener('click', handleCheckout);

    // Customizer
    closeCustomizer.addEventListener('click', closeCustomizerModal);
    customText.addEventListener('input', updateCustomization);
    customImage.addEventListener('change', handleImageUpload);
    addCustomToCart.addEventListener('click', addCustomItemToCart);
    lidStrawAddon.addEventListener('change', updateCustomization);

    // Color Options
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentCustomization.color = this.dataset.color;
            updatePreview();
            updateCustomization();
        });
    });

    // Glitter Options
    document.querySelectorAll('.glitter-option').forEach(option => {
        option.addEventListener('click', function() {
            const glitter = this.dataset.glitter;
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                currentCustomization.glitter = currentCustomization.glitter.filter(g => g !== glitter);
            } else if (currentCustomization.glitter.length < 3) {
                this.classList.add('active');
                currentCustomization.glitter.push(glitter);
            } else {
                showNotification('You can only select 3 glitter colors', 'warning');
            }
            updateCustomization();
        });
    });

    // Add to Cart Buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            const price = parseFloat(this.dataset.price);
            addToCart(product, price);
        });
    });

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// Product Filters
function initializeProductFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const productCards = document.querySelectorAll('.product-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter products
            productCards.forEach(card => {
                const cardCategory = card.dataset.category;
                if (category === 'all' || cardCategory === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Cart Functions
function addToCart(productName, price, customization = null) {
    const existingItem = cart.find(item => 
        item.name === productName && 
        JSON.stringify(item.customization) === JSON.stringify(customization)
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: productName,
            price: price,
            quantity: 1,
            customization: customization
        });
    }

    updateCartDisplay();
    showSuccessMessage();
    
    // Close customizer if open
    if (customizerContainer.classList.contains('active')) {
        closeCustomizerModal();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.style.display = 'none';
        cartFooter.style.display = 'none';
    } else {
        emptyCart.style.display = 'none';
        cartItems.style.display = 'block';
        cartFooter.style.display = 'block';
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image"></div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">
                        ${item.customization ? formatCustomization(item.customization) : 'Standard item'}
                    </div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-price">£${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    cartSubtotal.textContent = `£${totalPrice.toFixed(2)}`;
    cartTotal.textContent = `£${totalPrice.toFixed(2)}`;
}

function formatCustomization(customization) {
    let details = [];
    if (customization.text) details.push(`Text: "${customization.text}"`);
    if (customization.color) details.push(`Color: ${customization.color}`);
    if (customization.glitter && customization.glitter.length > 0) {
        details.push(`Glitter: ${customization.glitter.join(', ')}`);
    }
    if (customization.hasLidStraw) details.push('Color Change Lid & Straw');
    return details.join(' • ');
}

function openCart() {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}
function openCheckoutModal() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    document.getElementById('checkout-modal').style.display = 'flex';

    const DELIVERY_FEE = 4.99;
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.quantity);
    const totalAmount = subtotal + DELIVERY_FEE;

    document.getElementById('checkout-summary').innerHTML = `
        <p><strong>Subtotal:</strong> £${subtotal.toFixed(2)}</p>
        <p><strong>Delivery:</strong> £${DELIVERY_FEE.toFixed(2)}</p>
        <p><strong>Total:</strong> £${totalAmount.toFixed(2)}</p>
    `;
    document.getElementById('card-total').textContent = totalAmount.toFixed(2);

    // Render PayPal button
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: totalAmount.toFixed(2), currency_code: 'GBP' }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                completeOrder(details.payer.name.given_name);
            });
        }
    }).render('#paypal-button-container');
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function completeOrder(customerName) {
    const DELIVERY_FEE = 4.99;
    const orderId = Date.now();
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    cart.forEach(item => {
        orders.push({
            id: orderId + '-' + Math.floor(Math.random() * 1000),
            product: item.name,
            customization: item.customization,
            price: item.price + DELIVERY_FEE,
            status: 'paid',
            time: Date.now(),
            previewImage: item.customization?.image || null
        });
    });

    localStorage.setItem('orders', JSON.stringify(orders));
    cart = [];
    localStorage.removeItem('cart');
    updateCartDisplay();
    closeCheckoutModal();
    closeCartModal();
    alert(`Order placed successfully! Thank you, ${customerName || 'Customer'}!`);
}
function handleCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const DELIVERY_FEE = 4.99;
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.quantity);
    const totalAmount = subtotal + DELIVERY_FEE;

    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmount.toFixed(2),
                        currency_code: 'GBP'
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Payment completed by ' + details.payer.name.given_name);

                const orderId = Date.now();
                const orders = JSON.parse(localStorage.getItem('orders') || '[]');

                cart.forEach(item => {
                    orders.push({
                        id: orderId + '-' + Math.floor(Math.random() * 1000),
                        product: item.name,
                        customization: item.customization,
                        price: item.price + DELIVERY_FEE,
                        status: 'paid',
                        time: Date.now(),
                        previewImage: item.customization?.image || null
                    });
                });

                localStorage.setItem('orders', JSON.stringify(orders));
                cart = [];
                localStorage.removeItem('cart');
                updateCartDisplay();
                closeCartModal();
                alert('Order placed successfully!');
            });
        }
    }).render('#paypal-button-container');
}




// Customizer Functions
function openCustomizer(productType) {
    
    const productData = getProductData(productType) || { name: 'Custom Item', price: 0.00 };

    scrollToSection('custom');
    currentCustomization = {
        product: productData.name,
        basePrice: productData.price,
        text: '',
        color: '#ff6b9d',
        image: null,
        glitter: [],
        hasLidStraw: false,
   

    };

    if (customText) customText.value = '';
    if (customImage) customImage.value = '';

    
    const allColors = document.querySelectorAll('.color-option');
    if (allColors.length) {
        allColors.forEach(opt => opt.classList.remove('active'));
        if (allColors[0]) allColors[0].classList.add('active');
    }

    const allGlitters = document.querySelectorAll('.glitter-option');
    if (allGlitters.length) {
        allGlitters.forEach(opt => opt.classList.remove('active'));
    }

    
    if (lidStrawAddon) lidStrawAddon.checked = false;

    if (glitterOptions) {
        if (productType === 'snowglobe') {
            glitterOptions.style.display = 'block';
        } else {
            glitterOptions.style.display = 'none';
        }
    }

    if (productType.includes('16') || productType === 'tumbler16' || productType === 'snowglobe') {
        if (lidStrawOptions) lidStrawOptions.style.display = 'block';
    } else {
        if (lidStrawOptions) lidStrawOptions.style.display = 'none';
    }

    // Update preview title
    if (previewTitle) previewTitle.textContent = productData.name;

    // Defer heavy DOM updates so UI doesn't freeze
    requestAnimationFrame(() => {
        updateCustomization();
        if (customizerContainer) {
            customizerContainer.classList.add('active');
        }
        
    });
}




function closeCustomizerModal() {
    customizerContainer.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function getProductData(productType) {
    const products = {
        'mug': { name: '10oz Mug', price: 5.00 },
        'bottle': { name: '10oz Water Bottle', price: 8.00 },
        'tumbler': { name: '10oz Glass Tumbler', price: 3.00 },
        'tumbler16': { name: '16oz Clear/Frosted Tumbler', price: 10.00 },
        'snowglobe': { name: '16oz Snow Globe Tumbler', price: 12.00 },
        'metal': { name: '20oz Metal Tumbler', price: 15.00 },
        'hoodie-adult': { name: 'Adult Hoodie', price: 25.00 },
        'hoodie-kids': { name: 'Kids Hoodie', price: 20.00 },
        'tee-adult': { name: 'Adult T-Shirt', price: 7.00 },
        'tee-kids': { name: 'Kids T-Shirt', price: 5.00 },
        'cap': { name: 'Cap', price: 5.00 },
        'bags': { name: 'Rucksacks & Drawstring Bags', price: 5.00 },
        'chopping': { name: 'Chopping Board', price: 15.00 },
        'coasters': { name: 'Coasters Set of 4', price: 5.00 },
        'slate': { name: 'Slate Signs', price: 5.00 }
    };
    
    return products[productType] || { name: 'Custom Item', price: 0.00 };
}

function updateCustomization() {
    currentCustomization.text = customText.value;
    currentCustomization.hasLidStraw = lidStrawAddon ? lidStrawAddon.checked : false;
    
    updatePreview();
    updatePricing();
}

function updatePreview() {
    previewText.textContent = currentCustomization.text || 'Your Text';
    previewText.style.color = currentCustomization.color;
    previewItem.style.background = `linear-gradient(135deg, ${currentCustomization.color}, ${adjustColor(currentCustomization.color, -20)})`;
    
    if (currentCustomization.image) {
        previewImage.style.backgroundImage = `url(${currentCustomization.image})`;
        previewImage.style.display = 'block';
    } else {
        previewImage.style.display = 'none';
    }
}

function updatePricing() {
    let total = currentCustomization.basePrice;
    
    basePrice.textContent = `£${currentCustomization.basePrice.toFixed(2)}`;
    
    // Text personalization
    if (currentCustomization.text.length > 0) {
        textPriceLine.style.display = 'flex';
        total += 2.00;
    } else {
        textPriceLine.style.display = 'none';
    }
    
    // Lid & Straw addon
    if (currentCustomization.hasLidStraw) {
        addonPriceLine.style.display = 'flex';
        total += 2.50;
    } else {
        addonPriceLine.style.display = 'none';
    }
    
    totalPrice.textContent = `£${total.toFixed(2)}`;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentCustomization.image = e.target.result;
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

function addCustomItemToCart() {
    if (!currentCustomization.product) {
        showNotification('Please select a product first!', 'warning');
        return;
    }
    
    const finalPrice = parseFloat(totalPrice.textContent.replace('£', ''));
    const customizationCopy = { ...currentCustomization };
    
    addToCart(currentCustomization.product, finalPrice, customizationCopy);
}

// Utility Functions
function adjustColor(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

function showSuccessMessage() {
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #2ed573, #1e90ff)' : 
                     type === 'warning' ? 'linear-gradient(135deg, #ffa726, #ff7043)' : 
                     'linear-gradient(135deg, #42a5f5, #478ed1)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 50px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 4000;
        transform: translateX(400px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Simulate form submission
    showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
    
    // Reset form
    event.target.reset();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.product-card, .feature-item, .contact-item').forEach(el => {
    observer.observe(el);
});

// Add loading states
function addLoadingState(element) {
    element.style.opacity = '0.7';
    element.style.pointerEvents = 'none';
    element.innerHTML += '<div class="loading-spinner"></div>';
}

function removeLoadingState(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('An error occurred:', e.error);
    showNotification('Something went wrong. Please try again.', 'warning');
});

// Performance optimization
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

// Debounced search functionality (if needed)
const debouncedSearch = debounce(function(searchTerm) {
    // Search implementation
    console.log('Searching for:', searchTerm);
}, 300);

// Local storage for cart persistence
function saveCartToStorage() {
    localStorage.setItem('beautifulboos_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('beautifulboos_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Load cart on page load
loadCartFromStorage();

// Save cart whenever it changes
const originalAddToCart = addToCart;
addToCart = function(...args) {
    originalAddToCart.apply(this, args);
    saveCartToStorage();
};

const originalRemoveFromCart = removeFromCart;
removeFromCart = function(...args) {
    originalRemoveFromCart.apply(this, args);
    saveCartToStorage();
};

const originalUpdateQuantity = updateQuantity;
updateQuantity = function(...args) {
    originalUpdateQuantity.apply(this, args);
    saveCartToStorage();
};
window.openCustomizer = openCustomizer;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
