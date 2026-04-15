//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import authRoutes from "./src/modules/auth/auth.routes.js";
import authenticate from "./src/common/middlewares/auth.middleware.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080;

dotenv.config()

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


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

app.use(cors({
  origin: "https://sitara-cinema-book-my-ticket.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(cors(corsOptions));

app.use(express.json());

app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); 
  res.send(result.rows);
});

app.put("/:id/:name", async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.params.name;
    const conn = await pool.connect(); 
    await conn.query("BEGIN");
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    if (result.rowCount === 0) {
      res.send({ error: "Seat already booked" });
      return;
    }
    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name]); 

    await conn.query("COMMIT");
    conn.release(); 
    res.send(updateResult);
  } catch (ex) {
    console.log(ex);
    res.send(500);
  }
});

async function startServer() {
  try {
    await initDB(); 
    app.listen(port, () =>
      console.log("Server starting on port: " + port)
    );
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();

export default pool