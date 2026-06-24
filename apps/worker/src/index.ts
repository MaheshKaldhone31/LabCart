import dotenv from "dotenv";
import { Pool } from "pg";
import { createClient } from "redis";

dotenv.config();

// ✅ Structured log tags
const LOG = {
  WORKER: "[WORKER]",
  REDIS: "[REDIS]",
  DB: "[DB]",
};

// ✅ PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

// ✅ Redis
const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
  console.error(`${LOG.REDIS} ❌ Error`, err);
});

// ✅ Main worker loop
async function start() {
  console.log(`${LOG.WORKER} 🚀 Starting...`);

  await redis.connect();
  console.log(`${LOG.REDIS} ✅ Connected`);

  console.log(`${LOG.WORKER} 💤 Waiting for jobs...`);

  while (true) {
    try {
      const result = await redis.brPop("orders", 0);

      if (!result) continue;

      const order = JSON.parse(result.element);

      console.log(`${LOG.WORKER} 🔄 Processing order ${order.id}`);

      // simulate processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await pool.query(
        "UPDATE orders SET status = 'COMPLETED' WHERE id = $1",
        [order.id]
      );

      console.log(`${LOG.WORKER} ✅ Completed order ${order.id}`);
    } catch (err) {
      console.error(`${LOG.WORKER} ❌ Error processing job`, err);
    }
  }
}

// ✅ Start worker
start()
  .then(() => {
    console.log(`${LOG.WORKER} ✅ Ready`);
  })
  .catch((err) => {
    console.error(`${LOG.WORKER} ❌ Crash`, err);
    process.exit(1);
  });