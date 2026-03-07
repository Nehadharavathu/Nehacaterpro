require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

console.log("SERVER FILE LOADED");

/* SERVE FRONTEND FILES */
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* SUPABASE DATABASE CONNECTION */
const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});

/* EMAIL CONFIGURATION */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/* REGISTER API */
app.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    try {

        const sql = `
        INSERT INTO users(name,email,password)
        VALUES ($1,$2,$3)
        `;

        await pool.query(sql,[name,email,password]);

        res.send("Registration Successful");

    } catch(err){

        console.log(err);
        res.status(500).send("Registration error");

    }

});

/* LOGIN API */
app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (email === "admin@nehacaterpro.com" && password === "admin123") {
        return res.send("Admin Login");
    }

    try{

        const sql = `
        SELECT * FROM users
        WHERE email=$1 AND password=$2
        `;

        const result = await pool.query(sql,[email,password]);

        if(result.rows.length > 0){
            res.send("User Login");
        }else{
            res.status(401).send("Invalid Email or Password");
        }

    }catch(err){

        console.log(err);
        res.status(500).send("Server error");

    }

});

/* BOOKING API */
app.post("/book", async (req, res) => {

    const { email, eventType, foodType, quantity, total } = req.body;

    try{

        const sql = `
        INSERT INTO bookings
        (user_email,event_type,food_type,quantity,total_price)
        VALUES ($1,$2,$3,$4,$5)
        `;

        await pool.query(sql,[email,eventType,foodType,quantity,total]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
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

        transporter.sendMail(mailOptions,(error,info)=>{

            if(error){
                console.log(error);
                return res.send("Booking saved but email failed");
            }

            console.log("Email sent:",info.response);
            res.send("Booking saved and confirmation email sent!");

        });

    }catch(err){

        console.log(err);
        res.status(500).send("Booking failed");

    }

});

/* ADMIN BOOKINGS */
app.get("/bookings", async (req,res)=>{

    try{

        const result = await pool.query(`
        SELECT * FROM bookings
        ORDER BY booking_time DESC
        `);

        res.json(result.rows);

    }catch(err){

        console.log(err);
        res.status(500).send("Error fetching bookings");

    }

});

/* SERVER START */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
