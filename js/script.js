console.log("SCRIPT IS WORKING");

/* ================= REGISTER ================= */

document.getElementById("registerForm")?.addEventListener("submit", async function (e) {

    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const message = await response.text();
        alert(message);

        if (response.ok) {
            window.location.href = "login.html";
        }

    } catch (error) {

        console.error(error);
        alert("Server connection error");

    }

});


/* ================= LOGIN ================= */

document.getElementById("loginForm")?.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const message = await response.text();
        alert(message);

        if(message === "Admin Login"){
            window.location.href = "admin.html";
        }
        else if(message === "User Login"){
            localStorage.setItem("userEmail", email);
            window.location.href = "booking.html";
        }

    } catch (error) {

        console.error(error);
        alert("Server connection error");

    }

});


/* ================= BOOKING ================= */

document.getElementById("bookingForm")?.addEventListener("submit", async function(e){

    e.preventDefault();

    const eventType = document.getElementById("eventType").value;
    const foodType = document.getElementById("foodType").value;
    const quantity = parseInt(document.getElementById("quantity").value);

    const email = localStorage.getItem("userEmail");

    let price = foodType === "Veg" ? 300 : 500;
    const total = price * quantity;

    document.getElementById("totalPrice").innerText = "Total: ₹" + total;

    try {

        const response = await fetch("/book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                eventType,
                foodType,
                quantity,
                total
            })
        });

        const message = await response.text();
        alert(message);

    } catch(error) {

        console.error(error);
        alert("Booking failed");

    }

});