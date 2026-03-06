const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

console.log("SERVER FILE LOADED");

/* EMAIL CONFIGURATION */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "nehadharavathu@gmail.com",
        pass: "ublv rdah gqix aevs"
    }
});

/* MYSQL CONNECTION */
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "nehacaterpro"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL");
    }
});

/* ROOT ROUTE */
app.get("/", (req, res) => {
    res.send("Backend Working");
});


/* REGISTER API */
app.post("/register", (req, res) => {

    const { name, email, password } = req.body;

    const sql = "INSERT INTO users (name,email,password) VALUES (?,?,?)";

    db.query(sql, [name, email, password], (err) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Registration error");
        }

        res.send("Registration Successful");

    });

});


/* LOGIN API (USER + ADMIN) */
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    // ⭐ ADMIN LOGIN
    if (email === "admin@nehacaterpro.com" && password === "admin123") {
        return res.send("Admin Login");
    }

    const sql = "SELECT * FROM users WHERE email=? AND password=?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Server error");
        }

        if (result.length > 0) {
            res.send("User Login");
        } else {
            res.status(401).send("Invalid Email or Password");
        }

    });

});


/* BOOKING API */
app.post("/book", (req, res) => {

    const { email, eventType, foodType, quantity, total } = req.body;

    const sql = "INSERT INTO bookings (user_email, event_type, food_type, quantity, total_price) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [email, eventType, foodType, quantity, total], (err) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Booking failed");
        }

        const mailOptions = {
            from: "nehadharavathu@gmail.com",
            to: email,
            subject: "Booking Confirmation - NehaCaterPro",
            text: `
Booking Confirmed!

Event: ${eventType}
Food: ${foodType}
Number of Plates: ${quantity}
Total Price: ₹${total}

Thank you for choosing NehaCaterPro!
`
        };

        transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
                console.log("Email error:", error);
                return res.send("Booking saved but email failed");
            }

            console.log("Email sent:", info.response);
            res.send("Booking saved and confirmation email sent!");

        });

    });

});


/* GET ALL BOOKINGS (ADMIN DASHBOARD) */
app.get("/bookings", (req, res) => {

    console.log("FETCH BOOKINGS API CALLED");

    const sql = "SELECT * FROM bookings";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Error fetching bookings");
        }

        res.json(result);

    });

});


/* SERVER START */
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});