import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import { createClient } from "redis";

dotenv.config();

const LOG = {
  API: "[API]",
  DB: "[DB]",
  REDIS: "[REDIS]",
  ORDER: "[ORDER]"
};

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 4000);

// ================== POSTGRES ==================
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres",
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || "labcart",
  user: process.env.POSTGRES_USER || "labcart",
  password: process.env.POSTGRES_PASSWORD || "labcart",
});

// ✅ Prevent crash on unexpected DB errors
pool.on("error", (err) => {
  const error = err as Error;
  console.error(`${LOG.DB} ❌ Unexpected`, error.message);
});

// ================== REDIS ==================
const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
  const error = err as Error;
  console.error(`${LOG.REDIS} ❌ Error`, error.message);
});

// ================== DB RETRY ==================
async function waitForDB() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log(`${LOG.DB} ✅ Connected`);
      break;
    } catch {
      console.log(`${LOG.DB} ⏳ Waiting for DB...`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
}

// ================== INIT ==================
async function init() {
  await redis.connect();
  console.log(`${LOG.REDIS} ✅ Connected`);

  // ✅ wait for DB before running queries
  await waitForDB();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT,
      price INT,
      stock INT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      status TEXT DEFAULT 'PENDING',
      total INT
    )
  `);

  console.log(`${LOG.DB} ✅ PostgreSQL ready`);

  const res = await pool.query("SELECT COUNT(*) FROM products");

  if (res.rows[0].count == 0) {
    await pool.query(`
      INSERT INTO products (name, price, stock)
      VALUES ('Pod Mug', 300, 10), ('Cluster Tee', 500, 20)
    `);

    console.log(`${LOG.DB} ✅ Seeded products`);
  }
}

// ================== HEALTH ==================
app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok" });
  } catch {
    res.status(500).json({ status: "db-down" });
  }
});

// ================== ROUTES ==================

app.get("/products", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(`${LOG.DB} ❌ Query error`, (err as Error).message);
    res.status(500).send("DB error");
  }
});

app.post("/orders", async (req, res) => {
  try {
    const { items } = req.body;

    let total = 0;

    for (const item of items) {
      const p = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [item.id]
      );

      total += p.rows[0].price * item.qty;
    }

    const order = await pool.query(
      "INSERT INTO orders (total) VALUES ($1) RETURNING *",
      [total]
    );

    console.log(`${LOG.ORDER} 📦 Created order ${order.rows[0].id}`);

    await redis.lPush("orders", JSON.stringify(order.rows[0]));

    res.json(order.rows[0]);
  } catch (err) {
    console.error(`${LOG.ORDER} ❌ Error`, (err as Error).message);
    res.status(500).send("Order failed");
  }
});

app.get("/orders", async (_, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders");
    res.json(result.rows);
  } catch (err) {
    console.error(`${LOG.DB} ❌ Query error`, (err as Error).message);
    res.status(500).send("DB error");
  }
});

// ================== START ==================

async function start() {
  try {
    await init();

    app.listen(port, "0.0.0.0", () => {
      console.log(`${LOG.API} ✅ Running on http://0.0.0.0:${port}`);
    });
  } catch (err) {
    console.error(`${LOG.API} ❌ Startup failed`, (err as Error).message);
    process.exit(1);
  }
}

start();