const CART_STORAGE_KEY = 'ecomart_cart';

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
   
    if (document.getElementById('cartItemsList')) {
        renderCartPage();
    }
    
    if (document.getElementById('checkoutItemsList')) {
        renderCheckoutSummary();
    }

    if (document.getElementById('checkoutForm')) {
        bindCheckoutForm();
    }
});


function getCart() {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
}


function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
}


function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }

    saveCart(cart);
    alert(`${product.title} has been added to your eco-friendly cart!`);
}


function updateQuantity(productId, newQty) {
    let cart = getCart();
    const qty = parseInt(newQty);

    if (isNaN(qty) || qty <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = qty;
        saveCart(cart);
        if (document.getElementById('cartItemsList')) {
            renderCartPage();
        }
    }
}


function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);

    if (document.getElementById('cartItemsList')) {
        renderCartPage();
    }
}


function updateCartBadge() {
    const cartBadge = document.getElementById('cartCount');
    if (!cartBadge) return;

    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;
}


function calculateTotals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + shipping + tax;

    return {
        subtotal: subtotal.toFixed(2),
        shipping: shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`,
        tax: tax.toFixed(2),
        total: total.toFixed(2)
    };
}


function renderCartPage() {
    const cartListContainer = document.getElementById('cartItemsList');
    const cartLayout = document.getElementById('cartLayout');
    const emptyCartView = document.getElementById('emptyCartView');
    const cart = getCart();

    if (cart.length === 0) {
        if (cartLayout) cartLayout.classList.add('hidden');
        if (emptyCartView) emptyCartView.classList.remove('hidden');
        return;
    }

    if (cartLayout) cartLayout.classList.remove('hidden');
    if (emptyCartView) emptyCartView.classList.add('hidden');

    cartListContainer.innerHTML = cart.map(item => `
        <div class="cart-item-row" data-id="${item.id}">
            <div class="cart-product-info">
                <img src="${item.image}" alt="${item.title}">
                <div>
                    <h4>${item.title}</h4>
                    <span class="product-category">${item.category}</span>
                </div>
            </div>
            <div class="cart-price">$${item.price.toFixed(2)}</div>
            <div class="cart-qty">
                <div class="qty-selector">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-subtotal">$${(item.price * item.quantity).toFixed(2)}</div>
            <div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Remove Item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `).join('');

  
    const totals = calculateTotals(cart);
    document.getElementById('cartSubtotal').textContent = `$${totals.subtotal}`;
    document.getElementById('shippingCost').textContent = totals.shipping;
    document.getElementById('taxCost').textContent = `$${totals.tax}`;
    document.getElementById('cartTotal').textContent = `$${totals.total}`;
}


function renderCheckoutSummary() {
    const checkoutContainer = document.getElementById('checkoutItemsList');
    const cart = getCart();

    if (cart.length === 0) {
        window.location.href = 'products.html';
        return;
    }

    checkoutContainer.innerHTML = cart.map(item => `
        <div class="summary-row" style="font-size: 0.9rem;">
            <span>${item.title} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    const totals = calculateTotals(cart);
    document.getElementById('checkoutSubtotal').textContent = `$${totals.subtotal}`;
    document.getElementById('checkoutShipping').textContent = totals.shipping;
    document.getElementById('checkoutTax').textContent = `$${totals.tax}`;
    document.getElementById('checkoutTotal').textContent = `$${totals.total}`;
}


function bindCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const cart = getCart();
        if (cart.length === 0) return;

        const orderId = 'ECO-' + Math.floor(10000 + Math.random() * 90000);
        
      
        const existingOrders = JSON.parse(localStorage.getItem('ecomart_orders') || '[]');
        const newOrder = {
            id: orderId,
            date: new Date().toLocaleDateString(),
            items: cart,
            total: calculateTotals(cart).total,
            customer: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value
            }
        };

        existingOrders.push(newOrder);
        localStorage.setItem('ecomart_orders', JSON.stringify(existingOrders));

      
        localStorage.removeItem(CART_STORAGE_KEY);
        updateCartBadge();

       
        document.getElementById('checkoutLayout').classList.add('hidden');
        document.getElementById('confirmedOrderId').textContent = `#${orderId}`;
        document.getElementById('orderConfirmationCard').classList.remove('hidden');
    });
}