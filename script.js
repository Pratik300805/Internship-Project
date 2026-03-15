// Wrap initialization in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if elements exist
    if (document.getElementById('authButton')) {
        const authButton = document.getElementById('authButton');
        const authModal = new bootstrap.Modal(document.getElementById('authModal'));
        const authForm = document.getElementById('authForm');
        const switchToSignup = document.getElementById('switchToSignup');
        let isSignUp = false;

        // Rest of your auth code
        authForm?.addEventListener('submit', (e) => {
            // Existing submit handler
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const authAction = isSignUp 
                ? firebase.auth().createUserWithEmailAndPassword(email, password)
                : firebase.auth().signInWithEmailAndPassword(email, password);

            authAction
                .then((userCredential) => {
                    if (isSignUp) {
                        // For new users, add basic user data
                        return db.collection('users').doc(userCredential.user.uid).set({
                            email: email,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                })
                .then(() => authModal.hide())
                .catch(error => alert(error.message));

        });
        
        switchToSignup?.addEventListener('click', () => {
            // Existing switch handler
            isSignUp = !isSignUp;
            authForm.querySelector('button[type="submit"]').textContent = isSignUp ? 'Sign Up' : 'Login';
            switchToSignup.textContent = isSignUp ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up';
        });
    }
});
// DOM Elements - Safe declaration
if (typeof authButton === 'undefined') {
    var authButton = document.getElementById('authButton');
    var authModal = new bootstrap.Modal(document.getElementById('authModal'));
    var authForm = document.getElementById('authForm');
    var switchToSignup = document.getElementById('switchToSignup');
}


  // Auth State Listener
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        authButton.innerHTML = ` <i class="fas fa-user me-2"></i> Logout `;
        authButton.onclick = () => firebase.auth().signOut();
        
        // Check if user is admin
        checkAdminStatus(user.uid);
    } else {
        authButton.innerHTML = `<i class="fas fa-user me-2"></i> Login`;
        authButton.onclick = () => authModal.show();
    }
});


// Switch between Login and Sign Up
switchToSignup.addEventListener('click', () => {
    isSignUp = !isSignUp;
    authForm.querySelector('button[type="submit"]').textContent = isSignUp ? 'Sign Up' : 'Login';
    switchToSignup.textContent = isSignUp ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up';
});

// Handle Auth Form Submission
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const authAction = isSignUp 
        ? firebase.auth().createUserWithEmailAndPassword(email, password)
        : firebase.auth().signInWithEmailAndPassword(email, password);

    authAction
        .then((userCredential) => {
            if (isSignUp) {
                // For new users, add basic user data
                return db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .then(() => authModal.hide())
        .catch(error => alert(error.message));
});

// Cart Functions
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price, image, description = '') {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, description, quantity: 1 });
    }

    saveCart(cart);
    alert(`${name} added to cart!`);
}

function clearCart() {
    localStorage.removeItem("cart");
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
}

function calculateTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function goToCart() {
    window.location.href = "cart.html";
}

function removeItem(itemName) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== itemName);
    saveCart(cart);
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
}

// Order Functions
function orderNow(name, price, image, description = '') {
    const user = firebase.auth().currentUser;
    if (!user) {
        authModal.show();
        return;
    }

    const button = event.target;
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Ordering...';

    db.collection("orders").add({
        userId: user.uid,
        items: [{ name, price, image, description, quantity: 1 }],
        total: price,
        status: "pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        type: "direct"
    })
    .then(() => {
        alert(`Your ${name} order has been placed!`);
        window.location.href = "orders.html";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Order failed: " + error.message);
    })
    .finally(() => {
        button.disabled = false;
        button.textContent = 'Order Now';
    });
}

function placeOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Please login to place an order");
        authModal.show();
        return;
    }

    const button = document.querySelector('.place-order-btn');
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';

    db.collection("orders").add({
        userId: user.uid,
        items: cart,
        total: calculateTotal(cart),
        status: "pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        type: "cart"
    })
    .then(() => {
        alert("Order placed successfully!");
        clearCart();
        window.location.href = "orders.html";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Order failed: " + error.message);
    })
    .finally(() => {
        button.disabled = false;
        button.textContent = 'Place Order';
    });
}

// Make functions available globally
window.addToCart = addToCart;
window.goToCart = goToCart;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.placeOrder = placeOrder;
window.orderNow = orderNow;