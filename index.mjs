//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from 'express'
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import authRoutes from './backend/src/modules/auth/auth.route.js'
import dotenv from "dotenv";
import pool from './backend/src/db/pool.js';

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse

const app = new express();

app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://sitara-cinema-book-my-ticket.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('/{*path}', cors()); 
app.use(express.json())
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        seat_number INT,
        isbooked BOOLEAN DEFAULT false,
        name VARCHAR(255)
      );
    `);

    const check = await pool.query("SELECT COUNT(*) FROM seats");
    if (parseInt(check.rows[0].count) === 0) {
      for (let i = 1; i <= 64; i++) {
        await pool.query(
          "INSERT INTO seats (seat_number, isbooked) VALUES ($1, false)",
          [i]
        );
      }
      console.log("Seats inserted");
    }

    console.log("DB ready");
  } catch (err) {
    console.error("DB init error:", err.message);
    throw err;
  }
}

//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});

//book a seat give the seatId and your name

app.put("/:id/:name", async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      res.send({ error: "Seat already booked" });
      return;
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    res.send(updateResult);
  } catch (ex) {
    console.log(ex);
    res.send(500);
  }
});

async function startServer() {
  try {
    await initDB(); 
    app.listen(port, () => {
      console.log("Server running on port:", port);
    });
  } catch (err) {
    process.exit(1);
  }
}

startServer()
