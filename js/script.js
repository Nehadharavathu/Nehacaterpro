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

        if(message === "Admin Login"){
            window.location.href = "admin.html";
        }
        else if(message === "User Login"){
            localStorage.setItem("userEmail", email);
            window.location.href = "booking.html";
        }
        else{
            alert(message);
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

    if(!email){
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    let price = 0;

    if(foodType === "Veg") price = 300;
    else if(foodType === "NonVeg") price = 500;
    else if(foodType === "Vegan") price = 350;
    else if(foodType === "Jain") price = 320;
    else if(foodType === "SouthIndian") price = 400;
    else if(foodType === "NorthIndian") price = 420;
    else if(foodType === "Korean") price = 500;
    else if(foodType === "MultiCuisine") price = 600;
    else if(foodType === "Chinese") price = 450;

    const total = price * quantity;

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

        if(response.ok){

            // Redirect to success page
            window.location.href = "success.html";

        } 
        else{

            alert("Booking failed");

        }

    } catch(error){

        console.error(error);
        alert("Server connection error");

    }

});


/* ================= AUTO TOTAL CALCULATION ================= */

const quantityInput = document.getElementById("quantity");
const foodSelect = document.getElementById("foodType");

function updateTotal(){

    const quantity = parseInt(quantityInput.value) || 0;
    const foodType = foodSelect.value;

    let price = 0;

    if(foodType === "Veg") price = 300;
    else if(foodType === "NonVeg") price = 500;
    else if(foodType === "Vegan") price = 350;
    else if(foodType === "Jain") price = 320;
    else if(foodType === "SouthIndian") price = 400;
    else if(foodType === "NorthIndian") price = 420;
    else if(foodType === "Korean") price = 500;
    else if(foodType === "MultiCuisine") price = 600;
    else if(foodType === "Chinese") price = 450;

    const total = price * quantity;

    const totalDisplay = document.getElementById("totalPrice");

    if(totalDisplay){
        totalDisplay.innerText = "Total: ₹" + total;
    }

}

quantityInput?.addEventListener("input", updateTotal);
foodSelect?.addEventListener("change", updateTotal);