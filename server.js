require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

console.log("SERVER FILE LOADED");

/* ================= SERVE FRONTEND ================= */

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* ================= DATABASE CONNECTION ================= */

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
.then(() => {
    console.log("Connected to PostgreSQL Database");
})
.catch((err) => {
    console.error("Database connection error:", err);
});

/* ================= REGISTER API ================= */

app.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    try {

        const sql = `
        INSERT INTO users(name,email,password)
        VALUES ($1,$2,$3)
        `;

        await pool.query(sql, [name, email, password]);

        res.status(200).send("Registration Successful");

    } catch (err) {

        console.error("Register Error:", err);
        res.status(500).send("Registration error");

    }

});

/* ================= LOGIN API ================= */

app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (email === "admin@nehacaterpro.com" && password === "admin123") {
        return res.send("Admin Login");
    }

    try {

        const sql = `
        SELECT * FROM users
        WHERE email=$1 AND password=$2
        `;

        const result = await pool.query(sql, [email, password]);

        if (result.rows.length > 0) {
            res.send("User Login");
        } else {
            res.status(401).send("Invalid Email or Password");
        }

    } catch (err) {

        console.error("Login Error:", err);
        res.status(500).send("Server error");

    }

});

/* ================= BOOKING API ================= */

app.post("/book", async (req, res) => {

    const { eventType, foodType, quantity, total, email } = req.body;

    if (!email) {
        return res.status(400).send("Email missing");
    }

    try {

        const sql = `
        INSERT INTO bookings
        (user_email,event_type,food_type,quantity,total_price)
        VALUES ($1,$2,$3,$4,$5)
        `;

        await pool.query(sql, [email, eventType, foodType, quantity, total]);

        console.log("Booking saved in database");

        res.status(200).send("Booking confirmed!");

    } catch (err) {

        console.log("Booking Error:", err);
        res.status(500).send("Booking failed");

    }

});

/* ================= ADMIN BOOKINGS ================= */

app.get("/bookings", async (req, res) => {

    try {

        const result = await pool.query(`
        SELECT * FROM bookings
        ORDER BY id DESC
        `);

        res.json(result.rows);

    } catch (err) {

        console.error("Fetch Bookings Error:", err);
        res.status(500).send("Error fetching bookings");

    }

});

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});