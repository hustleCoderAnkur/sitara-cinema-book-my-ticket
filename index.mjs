//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import cors from "cors";
import authRoutes from './backend/src/modules/auth/auth.route.js'
import dotenv from "dotenv";

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = new express();

app.use((req, res, next) => {
  console.log("---- REQUEST ----");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Origin:", req.headers.origin);
  console.log("Headers:", req.headers);
  console.log("-----------------\n");
  next();
});

app.use(cors({
  origin: (origin, callback) => {
    console.log("CORS Origin:", origin);
    callback(null, true); // temporarily allow all for debugging
  }
}));

app.options("*", (req, res) => {
  console.log("🔥 OPTIONS HIT:", req.originalUrl);
  res.sendStatus(200);
});

router.post("/register", (req, res) => {
  console.log("REGISTER BODY:", req.body);
  // existing logic
});

router.post("/login", (req, res) => {
  console.log("LOGIN BODY:", req.body);
});

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(cors(corsOptions));

app.use(express.json());

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
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
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

app.listen(port, () => console.log("Server starting on port: " + port));

export default pool