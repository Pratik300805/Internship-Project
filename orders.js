function displayOrders() {
    const orderContainer = document.getElementById("order-items");
    if (!orderContainer) {
        console.error("Order container not found");
        return;
    }

    orderContainer.innerHTML = "<div class='spinner-border text-primary'></div>";
    // Rest of the function remains same
    
    // Use auth state listener
    firebase.auth().onAuthStateChanged((user) => {

        // User is authenticated, proceed with fetch
        firebase.firestore().collection("orders")
            .where("userId", "==", user.uid)
            .orderBy("timestamp", "desc")
            .get()
            .then((querySnapshot) => {
                orderContainer.innerHTML = "";
                if (querySnapshot.empty) {
                    orderContainer.innerHTML = "<p>No orders found</p>";
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const order = doc.data();
                    const orderCard = document.createElement("div");
                    orderCard.className = "order-card";
                    orderCard.innerHTML = `
                        <div class="card mb-4 shadow ">
                            <div class="card-body ">
                                <h5 class="card-title">Order ID: ${doc.id}</h5>
                                <p class="text-muted">Date: ${order.timestamp?.toDate().toLocaleString()}</p>
                                <div class="order-status ${getStatusClass(order.status)}">Status: ${order.status}</div>
                                <hr>
                                ${order.items.map(item => `
                                    <div class="order-item d-flex align-items-center mb-3">
                                        <img src="${item.image}" alt="${item.name}" class="mr-3" width="80">
                                        <div>
                                            <h6>${item.name}</h6>
                                            <p>Quantity: ${item.quantity} | Price: ₹${item.price}</p>
                                        </div>
                                    </div>
                                `).join('')}
                                <h5 class="text-right">Total: ₹${order.total}</h5>
                            </div>
                        </div>
                    `;
                    orderContainer.appendChild(orderCard);
                });
            })
    });
}

// Keep the rest of the code the same
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'pending': return 'status-pending';
        case 'accepted': return 'status-accepted';
        case 'rejected': return 'status-rejected';
        default: return '';
    }
}

// Initialize when page loads
window.onload = displayOrders;