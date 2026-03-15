function displayCart() {
    const cart = getCart();
    const cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty</p>";
        return;
    }

    cart.forEach(item => {
        const itemCard = document.createElement("div");
        itemCard.classList.add("cart-card");
        itemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p>Price: ₹${item.price}</p>
            <p>Quantity: ${item.quantity}</p>
            <button class="btn btn-danger" onclick="removeItem('${item.name.replace(/'/g, "\\'")}')">Remove</button>
        `;
        cartContainer.appendChild(itemCard);
    });
}

function removeItem(itemName) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== itemName);
    saveCart(cart);
    displayCart();
}

// Initialize when page loads
window.onload = displayCart;