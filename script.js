let cart = [];
let notificationCount = 0;
let currentSearch = '';

function handleSearchInput(event) {
    currentSearch = event.target.value;
    displayFoods();
}

function matchesSearchTerms(text, terms) {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    return terms.every(term => words.some(word => word.startsWith(term)));
}

function showNotification(message) {
    const notificationId = `notification-${Date.now()}`;
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.top = `${100 + (notificationCount * 70)}px`;
    
    document.body.appendChild(notification);
    notificationCount++;
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
                notificationCount--;
                // Reposition remaining notifications
                updateNotificationPositions();
            }
        }, 300);
    }, 2000);
}

function updateNotificationPositions() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach((notification, index) => {
        notification.style.top = `${100 + (index * 70)}px`;
    });
}

function displayFoods() {
    const foodGrid = document.getElementById('foodGrid');
    const categoryNav = document.getElementById('categoryNav');
    const searchTerms = currentSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);

    const filteredFoods = foods.filter(food => {
        if (searchTerms.length === 0) return true;
        const combinedText = `${food.name} ${food.category}`;
        return matchesSearchTerms(combinedText, searchTerms);
    });

    if (filteredFoods.length === 0) {
        categoryNav.innerHTML = '';
        foodGrid.innerHTML = '<p class="no-results">No products found for your search.</p>';
        return;
    }

    // Group foods by category
    const categories = {};
    filteredFoods.forEach(food => {
        if (!categories[food.category]) {
            categories[food.category] = [];
        }
        categories[food.category].push(food);
    });
    
    // Navigation links
    const sortedCategories = Object.keys(categories).sort();
    categoryNav.innerHTML = sortedCategories.map(category => 
        `<a onclick="scrollToCategory('${category}')">${category}</a>`
    ).join('');
    
    // Create HTML with category sections
    let html = '';
    sortedCategories.forEach(category => {
        html += `<div class="category-section" id="cat-${category.replace(/\s+/g, '-')}">
            <h2 class="category-title">${category}</h2>
        </div>`;
        
        categories[category].forEach(food => {
            html += `
                <div class="food-card">
                    <img src="${food.image}" alt="${food.name} - Freshly baked pastry" class="food-image">
                    <div class="food-info">
                        <div class="food-name">${food.name}</div>
                        <div class="food-price">$${food.price.toFixed(2)}</div>
                        <button class="add-btn" onclick="addToCart(${food.id})" aria-label="Add ${food.name} to cart">Add to Cart</button>
                    </div>
                </div>
            `;
        });
    });
    
    foodGrid.innerHTML = html;
}

function scrollToCategory(category) {
    const categoryId = `cat-${category.replace(/\s+/g, '-')}`;
    const element = document.getElementById(categoryId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function addToCart(foodId) {
    const food = foods.find(f => f.id === foodId);
    const existingItem = cart.find(item => item.id === foodId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...food, quantity: 1 });
    }
    
    showNotification(`✓ ${food.name} added to cart!`);
    updateCart();
}

function updateCart() {
    document.getElementById('cartCount').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartItems = document.getElementById('cartItems');
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)" aria-label="Decrease quantity of ${item.name}">-</button>
                    <span aria-label="${item.quantity} ${item.name} in cart">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)" aria-label="Increase quantity of ${item.name}">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})" aria-label="Remove ${item.name} from cart"><img src="photos/trash.png" alt="Remove" class="trash-icon"></button>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').innerText = total.toFixed(2);
}

function updateQuantity(foodId, change) {
    const item = cart.find(item => item.id === foodId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(foodId);
        } else {
            updateCart();
        }
    }
}

function removeFromCart(foodId) {
    cart = cart.filter(item => item.id !== foodId);
    updateCart();
}

function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    const overlay = document.getElementById('overlay');
    const header = document.querySelector('header');
    const cartIcon = document.querySelector('.cart-icon');
    
    const isActive = cartModal.classList.contains('active');
    
    if (isActive) {
        // Closing cart
        cartModal.classList.remove('active');
        overlay.classList.remove('active');
        header.classList.remove('cart-open');
        cartIcon.setAttribute('aria-expanded', 'false');
        cartModal.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-hidden', 'true');
    } else {
        // Opening cart - hide any active notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        notificationCount = 0;
        
        cartModal.classList.add('active');
        overlay.classList.add('active');
        header.classList.add('cart-open');
        cartIcon.setAttribute('aria-expanded', 'true');
        cartModal.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-hidden', 'false');
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
    } else {
        alert('Thank you for your order! Your total for today is $' + document.getElementById('cartTotal').innerText + '. Thank you for shopping with us!');
        cart = [];
        updateCart();
        toggleCart();
    }
}

displayFoods();
