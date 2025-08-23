// Global Variables
let cart = [];
let currentCustomization = {
    product: '',
    basePrice: 0,
    text: '',
    color: '#c2185b',
    image: null,
    glitter: [],
    hasLidStraw: false
};

let customerDetails = {};

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
const scrollToTopBtn = document.getElementById('scroll-to-top');
const loadingScreen = document.getElementById('loading-screen');
const header = document.getElementById('header');

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
    // Show loading screen
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2000);
    
    initializeEventListeners();
    updateCartDisplay();
    initializeProductFilters();
    initializeMobileMenu();
    initializeScrollEffects();
    initializeParticles();
    initializeIntersectionObserver();
    loadCartFromStorage();
});

// Event Listeners
function initializeEventListeners() {
    // Cart Modal
    cartBtn?.addEventListener('click', openCart);
    closeCart?.addEventListener('click', closeCartModal);
    cartOverlay?.addEventListener('click', closeCartModal);
    continueShoppingBtn?.addEventListener('click', closeCartModal);
    checkoutBtn?.addEventListener('click', handleCheckout);

    // Customizer
    closeCustomizer?.addEventListener('click', closeCustomizerModal);
    customText?.addEventListener('input', debounce(updateCustomization, 300));
    customImage?.addEventListener('change', handleImageUpload);
    addCustomToCart?.addEventListener('click', addCustomItemToCart);
    lidStrawAddon?.addEventListener('change', updateCustomization);

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
                showNotification('Glitter added!', 'success');
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
            
            // Button animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            const navMenu = document.getElementById('nav-menu');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Scroll to top button
    scrollToTopBtn?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Advanced Scroll Effects
function initializeScrollEffects() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header effects
        if (scrollTop > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
        
        // Scroll direction detection
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        // Scroll to top button
        if (scrollTop > 500) {
            scrollToTopBtn?.classList.add('visible');
        } else {
            scrollToTopBtn?.classList.remove('visible');
        }
        
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero && scrollTop < window.innerHeight) {
            hero.style.transform = `translateY(${scrollTop * 0.5}px)`;
        }
        
        lastScrollTop = scrollTop;
    }, 16));
}

// Particles Animation
function initializeParticles() {
    const particlesContainer = document.getElementById('hero-particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: radial-gradient(circle, rgba(194, 24, 91, 0.6), transparent);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        particlesContainer.appendChild(particle);
    }
    
    // Add CSS animation for particles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
    `;
    document.head.appendChild(style);
}

// Intersection Observer for Animations
function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                
                // Add stagger animation for grid items
                if (entry.target.classList.contains('product-card')) {
                    const cards = document.querySelectorAll('.product-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.animationDelay = `${index * 100}ms`;
                            card.classList.add('fade-in');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Product Filters with Animation
function initializeProductFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const productCards = document.querySelectorAll('.product-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button with animation
            categoryBtns.forEach(b => {
                b.classList.remove('active');
                b.style.transform = 'scale(1)';
            });
            this.classList.add('active');
            this.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                this.style.transform = '';
            }, 200);

            // Filter products with stagger animation
            productCards.forEach((card, index) => {
                const cardCategory = card.dataset.category;
                
                setTimeout(() => {
                    if (category === 'all' || cardCategory === category) {
                        card.classList.remove('hidden');
                        card.style.animationDelay = `${index * 50}ms`;
                    } else {
                        card.classList.add('hidden');
                    }
                }, index * 25);
            });
        });
    });
}

// Enhanced Mobile Menu
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fas fa-times';
                this.style.transform = 'rotate(90deg)';
            } else {
                icon.className = 'fas fa-bars';
                this.style.transform = '';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
                mobileMenuBtn.style.transform = '';
            }
        });
    }
}

// Enhanced Cart Functions
function addToCart(productName, price, customization = null) {
    const existingItem = cart.find(item => 
        item.name === productName && 
        JSON.stringify(item.customization) === JSON.stringify(customization)
    );

    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`Updated ${productName} quantity!`, 'success');
    } else {
        cart.push({
            id: Date.now() + Math.random(),
            name: productName,
            price: price,
            quantity: 1,
            customization: customization
        });
        showNotification(`${productName} added to cart!`, 'success');
    }

    updateCartDisplay();
    saveCartToStorage();
    
    // Animate cart button
    cartBtn.style.transform = 'scale(1.1)';
    cartCount.style.animation = 'bounce 0.5s ease';
    
    setTimeout(() => {
        cartBtn.style.transform = '';
        cartCount.style.animation = '';
    }, 500);
    
    // Close customizer if open
    if (customizerContainer?.classList.contains('active')) {
        closeCustomizerModal();
    }
}

function removeFromCart(itemId) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        cart = cart.filter(item => item.id !== itemId);
        updateCartDisplay();
        saveCartToStorage();
        showNotification(`${item.name} removed from cart`, 'info');
    }
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = cart.length > 0 ? 4.99 : 0;
    const totalPrice = subtotal + deliveryFee;

    if (cartCount) cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartItems) cartItems.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'none';
        if (document.getElementById('cart-delivery')) document.getElementById('cart-delivery').style.display = 'none';
    } else {
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartItems) cartItems.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'block';
        if (document.getElementById('cart-delivery')) document.getElementById('cart-delivery').style.display = 'block';
        
        if (cartItems) {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item" style="animation-delay: ${index * 100}ms">
                    <div class="cart-item-image">
                        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #c2185b, #4ecdc4); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem;">
                            ${item.name.charAt(0)}
                        </div>
                    </div>
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
    }

    if (cartSubtotal) cartSubtotal.textContent = `£${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `£${totalPrice.toFixed(2)}`;
    if (document.getElementById('deliveryFee')) document.getElementById('deliveryFee').textContent = `£${deliveryFee.toFixed(2)}`;
}

function formatCustomization(customization) {
    let details = [];
    if (customization.text) details.push(`Text: "${customization.text}"`);
    if (customization.color && customization.color !== '#c2185b') details.push(`Color: ${customization.color}`);
    if (customization.glitter && customization.glitter.length > 0) {
        details.push(`Glitter: ${customization.glitter.join(', ')}`);
    }
    if (customization.hasLidStraw) details.push('Color Change Lid & Straw');
    return details.join(' • ');
}

function openCart() {
    cartModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Animate cart items
    setTimeout(() => {
        document.querySelectorAll('.cart-item').forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }, 100);
}

function closeCartModal() {
    cartModal?.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Checkout Functions
function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }

    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.style.display = 'flex';
        
        // Reset to first step
        showCustomerDetailsStep();
        
        // Update order summary
        updateCheckoutSummary();
    }
}

function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
    }
}

function showCustomerDetailsStep() {
    // Update step indicators
    document.getElementById('step-1').classList.add('active');
    document.getElementById('step-2').classList.remove('active');
    
    // Show/hide step content
    document.getElementById('customer-details-step').style.display = 'block';
    document.getElementById('payment-step').style.display = 'none';
}

function showPaymentStep() {
    // Update step indicators
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-2').classList.add('active');
    
    // Show/hide step content
    document.getElementById('customer-details-step').style.display = 'none';
    document.getElementById('payment-step').style.display = 'block';
}

function proceedToPayment() {
    const form = document.getElementById('customer-details-form');
    const formData = new FormData(form);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'postcode', 'country'];
    let isValid = true;
    
    for (let field of requiredFields) {
        const value = formData.get(field);
        if (!value || value.trim() === '') {
            isValid = false;
            const input = document.querySelector(`[name="${field}"]`);
            if (input) {
                input.style.borderColor = '#ff4757';
                input.addEventListener('input', function() {
                    this.style.borderColor = '';
                }, { once: true });
            }
        }
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // Store customer details
    customerDetails = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        postcode: formData.get('postcode'),
        country: formData.get('country'),
        notes: formData.get('notes')
    };
    
    // Show payment step
    showPaymentStep();
    
    // Update customer summary
    updateCustomerSummary();
    
    // Initialize PayPal
    initializePayPal();
}

function backToCustomerDetails() {
    showCustomerDetailsStep();
}

function updateCheckoutSummary() {
    const DELIVERY_FEE = 4.99;
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.quantity);
    const totalAmount = subtotal + DELIVERY_FEE;

    const summaryElement = document.getElementById('checkout-summary');
    if (summaryElement) {
        summaryElement.innerHTML = `
            <div style="background: linear-gradient(135deg, #fce4ec, #f8bbd9); padding: 1.5rem; border-radius: 15px; margin-bottom: 1.5rem;">
                <h4 style="color: #c2185b; margin-bottom: 1rem; font-family: 'Playfair Display', serif;">Order Summary</h4>
                ${cart.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #ad1457;">
                        <span>${item.name} x${item.quantity}</span>
                        <span>£${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <hr style="border: 1px solid rgba(194, 24, 91, 0.2); margin: 1rem 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #ad1457;">
                    <span>Subtotal:</span>
                    <span>£${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; color: #ad1457;">
                    <span>Delivery:</span>
                    <span>£${DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; color: #c2185b; border-top: 2px solid rgba(194, 24, 91, 0.2); padding-top: 1rem;">
                    <span>Total:</span>
                    <span>£${totalAmount.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
}

function updateCustomerSummary() {
    const summaryElement = document.getElementById('customer-summary');
    if (summaryElement && customerDetails.firstName) {
        summaryElement.innerHTML = `
            <h4>Delivery Details</h4>
            <p><strong>Name:</strong> ${customerDetails.firstName} ${customerDetails.lastName}</p>
            <p><strong>Email:</strong> ${customerDetails.email}</p>
            ${customerDetails.phone ? `<p><strong>Phone:</strong> ${customerDetails.phone}</p>` : ''}
            <p><strong>Address:</strong> ${customerDetails.address}</p>
            <p><strong>City:</strong> ${customerDetails.city}</p>
            <p><strong>Postcode:</strong> ${customerDetails.postcode}</p>
            <p><strong>Country:</strong> ${customerDetails.country}</p>
            ${customerDetails.notes ? `<p><strong>Notes:</strong> ${customerDetails.notes}</p>` : ''}
        `;
    }
}

function initializePayPal() {
    const DELIVERY_FEE = 4.99;
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.quantity);
    const totalAmount = subtotal + DELIVERY_FEE;

    // Clear existing PayPal buttons
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = '';
    }

    if (window.paypal) {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: totalAmount.toFixed(2),
                            currency_code: 'GBP'
                        },
                        description: `BeautifulBoos Order - ${cart.length} item(s)`
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Payment successful
                    completeOrder(details);
                });
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                showNotification('Payment failed. Please try again.', 'error');
            }
        }).render('#paypal-button-container');
    }
}

function completeOrder(paymentDetails) {
    const DELIVERY_FEE = 4.99;
    const orderId = Date.now();
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    cart.forEach(item => {
        orders.push({
            id: orderId + '-' + Math.floor(Math.random() * 1000),
            product: item.name,
            customization: item.customization,
            price: item.price * item.quantity + (DELIVERY_FEE / cart.length), // Distribute delivery fee
            status: 'paid',
            time: Date.now(),
            previewImage: item.customization?.image || null,
            customerDetails: customerDetails,
            paymentDetails: {
                paypalOrderId: paymentDetails.id,
                payerEmail: paymentDetails.payer.email_address,
                payerName: paymentDetails.payer.name.given_name + ' ' + paymentDetails.payer.name.surname
            }
        });
    });

    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    localStorage.removeItem('beautifulboos_cart');
    updateCartDisplay();
    
    // Close modals
    closeCheckoutModal();
    closeCartModal();
    
    // Show success message
    showNotification(`Order placed successfully! Thank you, ${customerDetails.firstName}!`, 'success');
    
    // Reset customer details
    customerDetails = {};
}

function handleCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }

    openCheckoutModal();
}

// Enhanced Customizer Functions
function openCustomizer(productType) {
    const productData = getProductData(productType) || { name: 'Custom Item', price: 0.00 };

    scrollToSection('custom');
    
    // Reset customization with animation
    currentCustomization = {
        product: productData.name,
        basePrice: productData.price,
        text: '',
        color: '#c2185b',
        image: null,
        glitter: [],
        hasLidStraw: false,
    };

    if (customText) {
        customText.value = '';
        customText.style.transform = 'scale(1.02)';
        setTimeout(() => customText.style.transform = '', 200);
    }
    
    if (customImage) customImage.value = '';

    // Reset UI elements with animation
    const allColors = document.querySelectorAll('.color-option');
    if (allColors.length) {
        allColors.forEach((opt, index) => {
            opt.classList.remove('active');
            setTimeout(() => {
                if (index === 0) opt.classList.add('active');
            }, index * 50);
        });
    }

    const allGlitters = document.querySelectorAll('.glitter-option');
    if (allGlitters.length) {
        allGlitters.forEach(opt => opt.classList.remove('active'));
    }

    if (lidStrawAddon) lidStrawAddon.checked = false;

    // Show/hide options based on product type
    if (glitterOptions) {
        glitterOptions.style.display = productType === 'snowglobe' ? 'block' : 'none';
    }

    if (lidStrawOptions) {
        const show16ozOptions = productType.includes('16') || productType === 'tumbler16' || productType === 'snowglobe';
        lidStrawOptions.style.display = show16ozOptions ? 'block' : 'none';
    }

    // Update preview title with animation
    if (previewTitle) {
        previewTitle.style.transform = 'scale(0.95)';
        previewTitle.textContent = productData.name;
        setTimeout(() => previewTitle.style.transform = '', 200);
    }

    // Update with smooth animation
    requestAnimationFrame(() => {
        updateCustomization();
        if (customizerContainer) {
            customizerContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
}

function closeCustomizerModal() {
    if (customizerContainer) {
        customizerContainer.style.opacity = '0';
        setTimeout(() => {
            customizerContainer.classList.remove('active');
            customizerContainer.style.opacity = '';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function getProductData(productType) {
    const products = {
        'mug': { name: '10oz Mug', price: 5.00 },
        'bottle': { name: '20oz Water Bottle', price: 8.00 },
        'tumbler': { name: '11oz Glass Tumbler', price: 3.00 },
        'tumbler16': { name: '10oz Snow Globe Tumbler', price: 10.00 },
        'snowglobe': { name: '16oz Snow Globe Tumbler', price: 12.00 },
        'metal': { name: '20oz Metal Tumbler', price: 15.00 },
        'hoodie-adult': { name: 'Adult Hoodie', price: 25.00 },
        'hoodie-kids': { name: 'Kids Hoodie', price: 20.00 },
        'tee-adult': { name: 'Adult T-Shirt', price: 7.00 },
        'tee-kids': { name: 'Kids T-Shirt', price: 5.00 },
        'cap': { name: 'Cap', price: 5.00 },
        'bags': { name: 'Rucksacks & Drawstring Bags', price: 5.00 },
        'Case': { name: 'Custom Pencil Cases', price: 5.00 }
    };
    
    return products[productType] || { name: 'Custom Item', price: 0.00 };
}

function updateCustomization() {
    currentCustomization.text = customText?.value || '';
    currentCustomization.hasLidStraw = lidStrawAddon?.checked || false;
    
    updatePreview();
    updatePricing();
}

function updatePreview() {
    if (previewText) {
        previewText.textContent = currentCustomization.text || 'Your Text';
        previewText.style.color = currentCustomization.color;
        previewText.style.transform = 'scale(1.05)';
        setTimeout(() => previewText.style.transform = '', 300);
    }
    
    if (previewItem) {
        previewItem.style.background = `linear-gradient(135deg, ${currentCustomization.color}, ${adjustColor(currentCustomization.color, -20)})`;
        previewItem.style.transform = 'scale(1.02)';
        setTimeout(() => previewItem.style.transform = '', 300);
    }
    
    if (previewImage) {
        if (currentCustomization.image) {
            previewImage.style.backgroundImage = `url(${currentCustomization.image})`;
            previewImage.style.display = 'block';
        } else {
            previewImage.style.display = 'none';
        }
    }
}

function updatePricing() {
    let total = currentCustomization.basePrice;
    
    if (basePrice) basePrice.textContent = `£${currentCustomization.basePrice.toFixed(2)}`;
    
    // Text personalization
    if (textPriceLine) {
        if (currentCustomization.text.length > 0) {
            textPriceLine.style.display = 'flex';
            total += 2.00;
        } else {
            textPriceLine.style.display = 'none';
        }
    }
    
    // Lid & Straw addon
    if (addonPriceLine) {
        if (currentCustomization.hasLidStraw) {
            addonPriceLine.style.display = 'flex';
            total += 2.50;
        } else {
            addonPriceLine.style.display = 'none';
        }
    }
    
    if (totalPrice) {
        totalPrice.style.transform = 'scale(1.05)';
        totalPrice.textContent = `£${total.toFixed(2)}`;
        setTimeout(() => totalPrice.style.transform = '', 200);
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showNotification('File size too large. Please choose a smaller image.', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentCustomization.image = e.target.result;
            updatePreview();
            showNotification('Image uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function addCustomItemToCart() {
    if (!currentCustomization.product) {
        showNotification('Please select a product first!', 'warning');
        return;
    }
    
    const finalPrice = parseFloat(totalPrice?.textContent.replace('£', '') || '0');
    const customizationCopy = { ...currentCustomization };
    
    addToCart(currentCustomization.product, finalPrice, customizationCopy);
}

// Enhanced Utility Functions
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

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const colors = {
        success: 'linear-gradient(135deg, #2ed573, #1e90ff)',
        warning: 'linear-gradient(135deg, #ffa726, #ff7043)',
        info: 'linear-gradient(135deg, #42a5f5, #478ed1)',
        error: 'linear-gradient(135deg, #ff4757, #ff3742)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
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
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-family: 'Inter', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 3000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = header?.offsetHeight || 80;
        const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        event.target.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Performance Optimizations
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Local Storage Functions
function saveCartToStorage() {
    try {
        localStorage.setItem('beautifulboos_cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Failed to save cart to storage:', e);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('beautifulboos_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    } catch (e) {
        console.error('Failed to load cart from storage:', e);
        cart = [];
    }
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('An error occurred:', e.error);
    showNotification('Something went wrong. Please try again.', 'error');
});

// Keyboard Navigation Support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (customizerContainer?.classList.contains('active')) {
            closeCustomizerModal();
        }
        if (cartModal?.classList.contains('active')) {
            closeCartModal();
        }
        if (document.getElementById('checkout-modal')?.style.display === 'flex') {
            closeCheckoutModal();
        }
    }
});

// Touch and Gesture Support
let touchStartY = 0;
document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', function(e) {
    if (customizerContainer?.classList.contains('active')) {
        const touchY = e.touches[0].clientY;
        const diff = touchStartY - touchY;
        if (diff < -100) { // Swipe down to close
            closeCustomizerModal();
        }
    }
});

// Global function exposure for onclick handlers
window.openCustomizer = openCustomizer;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.scrollToSection = scrollToSection;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.proceedToPayment = proceedToPayment;
window.backToCustomerDetails = backToCustomerDetails;

// Initialize theme
document.documentElement.style.setProperty('--primary-color', '#c2185b');
document.documentElement.style.setProperty('--secondary-color', '#4ecdc4');
document.documentElement.style.setProperty('--accent-color', '#ff6b9d');

console.log('✨ BeautifulBoos website loaded successfully!');

// Lightbox for gallery
document.addEventListener("DOMContentLoaded", () => {
  const galleryImages = document.querySelectorAll(".gallery-grid img");
  const lightbox = document.createElement("div");
  lightbox.classList.add("lightbox");
  document.body.appendChild(lightbox);

  const img = document.createElement("img");
  lightbox.appendChild(img);

  galleryImages.forEach(image => {
    image.addEventListener("click", () => {
      img.src = image.src;
      lightbox.classList.add("active");
    });
  });

  lightbox.addEventListener("click", () => {
    lightbox.classList.remove("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const categoryCards = document.querySelectorAll(".category-card");
  const productsSection = document.querySelector("#products .product-grid");
  const products = document.querySelectorAll(".product-card");

  // hide products until a category/nav action
  productsSection.style.display = "none";

  // function to show products with filter
  function showProducts(category) {
    productsSection.style.display = "grid";

    products.forEach(product => {
      if (category === "all" || product.getAttribute("data-category") === category) {
        product.style.display = "block";
        product.classList.add("fade-in");
      } else {
        product.style.display = "none";
        product.classList.remove("fade-in");
      }
    });
  }

  // category card clicks
  categoryCards.forEach(card => {
    card.addEventListener("click", () => {
      const category = card.getAttribute("data-category");

      showProducts(category);

      // highlight card
      categoryCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      // smooth scroll to products
      productsSection.scrollIntoView({ behavior: "smooth" });
    });
  });

  // nav links (shop now / products)
  const shopNowLink = document.querySelector("a[href='#products'], .shop-now-btn");
  if (shopNowLink) {
    shopNowLink.addEventListener("click", e => {
      e.preventDefault();
      showProducts("all");
      productsSection.scrollIntoView({ behavior: "smooth" });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery-grid");
  if (!gallery) return;

  const galleryItems = Array.from(gallery.querySelectorAll("img"));
  if (galleryItems.length <= 5) return; // nothing to hide

  // Hide everything after the 5th image
  galleryItems.slice(5).forEach(img => {
    img.style.display = "none";
  });

  // Create toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "Show Full Gallery";
  toggleBtn.classList.add("show-gallery-btn");
  gallery.insertAdjacentElement("afterend", toggleBtn);

  let expanded = false;

  toggleBtn.addEventListener("click", () => {
    expanded = !expanded;

    if (expanded) {
      galleryItems.forEach(img => (img.style.display = "block"));
      toggleBtn.textContent = "Show Less";
    } else {
      galleryItems.slice(5).forEach(img => (img.style.display = "none"));
      toggleBtn.textContent = "Show Full Gallery";
      gallery.scrollIntoView({ behavior: "smooth" });
    }
  });
});
