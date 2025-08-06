document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const closeCart = document.getElementById('close-cart');
  const continueBtn = document.getElementById('continue-shopping');
  const checkoutBtn = document.getElementById('checkout-btn');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const cartCount = document.getElementById('cart-count');

 let cart = JSON.parse(localStorage.getItem('cart')) || [];


  // 👉 Open the cart modal
  cartBtn.addEventListener('click', () => {
    cartModal.style.display = 'flex';
    renderCart();
  });

  // 👉 Close modal by X or Continue Shopping
  [closeCart, continueBtn].forEach(btn =>
    btn.addEventListener('click', () => {
      cartModal.style.display = 'none';
    })
  );

  // 👉 Dummy checkout
  checkoutBtn.addEventListener('click', () => {
    alert("Checkout is not implemented yet.");
  });

  // 👉 Handle Add to Cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      const image = btn.getAttribute('data-image');

      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ name, price, image, quantity: 1 });
      }

      renderCart();
    });
  });

  // 👉 Handle quantity changes inside the modal
  cartItemsContainer.addEventListener('click', (e) => {
    const index = e.target.dataset.index;
    if (e.target.classList.contains('increase')) {
      cart[index].quantity++;
    } else if (e.target.classList.contains('decrease')) {
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
      } else {
        cart.splice(index, 1);
      }
    } else if (e.target.classList.contains('remove')) {
      cart.splice(index, 1);
    }

    renderCart();
  });

  // 👉 Render Cart UI
  function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center">Your cart is empty.</p>';
    } else {
      cart.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-gray-100 rounded p-4';
        div.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
          <div class="flex-1 mx-4">
            <h3 class="font-bold">${item.name}</h3>
            <p class="text-sm text-gray-600">£${item.price.toFixed(2)} x ${item.quantity}</p>
            <div class="flex gap-2 mt-2">
              <button data-index="${index}" class="decrease px-2 bg-gray-200 rounded">-</button>
              <button data-index="${index}" class="increase px-2 bg-gray-200 rounded">+</button>
              <button data-index="${index}" class="remove px-2 bg-red-400 text-white rounded">🗑️</button>
            </div>
          </div>
          <div class="text-amber-600 font-bold">£${itemTotal.toFixed(2)}</div>
        `;
        cartItemsContainer.appendChild(div);
        localStorage.setItem('cart', JSON.stringify(cart));

      });
    }

    cartTotal.textContent = `£${total.toFixed(2)}`;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }
});

