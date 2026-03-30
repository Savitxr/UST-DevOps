const express = require("express");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
const port = parseInt(process.env.PORT || "8083", 10);
const serviceName = process.env.SERVICE_NAME || "cart-service";
const loggingUrl = process.env.LOGGING_URL || "";
const registryUrl = process.env.REGISTRY_URL || "";
const schema = process.env.DB_SCHEMA || "cart";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const requestId = req.header("X-Request-ID") || uuidv4();
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

async function logEvent(level, message, meta = {}) {
  const payload = {
    level,
    message,
    service: serviceName,
    requestId: meta.requestId || "unknown",
    meta
  };

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    ...payload
  }));

  if (loggingUrl) {
    try {
      await axios.post(loggingUrl, payload, { timeout: 1500 });
    } catch (error) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "WARN",
        service: serviceName,
        message: "logging_service_unavailable",
        meta: { error: error.message }
      }));
    }
  }
}

app.use((req, res, next) => {
  logEvent("INFO", "request_start", {
    requestId: req.requestId,
    method: req.method,
    path: req.path
  });
  res.on("finish", () => {
    logEvent("INFO", "request_end", {
      requestId: req.requestId,
      status: res.statusCode
    });
  });
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/cart/items", async (req, res) => {
  const { userId, productId, quantity } = req.body || {};
  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const id = uuidv4();
    const client = await pool.connect();
    try {
      await client.query(`SET search_path TO ${schema}`);
      await client.query(
        "INSERT INTO items (id, user_id, product_id, quantity) VALUES ($1, $2, $3, $4)",
        [id, userId, productId, quantity]
      );
    } finally {
      client.release();
    }

    return res.status(201).json({ id, userId, productId, quantity });
  } catch (error) {
    await logEvent("ERROR", "add_item_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "add_item_failed" });
  }
});

app.get("/api/cart/items", async (req, res) => {
  const { userId } = req.query || {};
  if (!userId) {
    return res.status(400).json({ error: "missing_user_id" });
  }

  try {
    const client = await pool.connect();
    let result;
    try {
      await client.query(`SET search_path TO ${schema}`);
      result = await client.query(
        "SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
    } finally {
      client.release();
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    await logEvent("ERROR", "list_cart_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "list_cart_failed" });
  }
});

async function registerWithRegistry() {
  if (!registryUrl) {
    return;
  }

  try {
    await axios.post(`${registryUrl}/register`, {
      serviceName,
      host: serviceName,
      port
    }, { timeout: 1500 });
    logEvent("INFO", "registry_registered", { requestId: "startup" });
  } catch (error) {
    logEvent("WARN", "registry_registration_failed", { error: error.message });
  }
}

function startHeartbeat() {
  if (!registryUrl) {
    return;
  }

  setInterval(() => {
    axios.post(`${registryUrl}/heartbeat`, {
      serviceName,
      host: serviceName,
      port
    }, { timeout: 1500 }).catch((error) => {
      logEvent("WARN", "registry_heartbeat_failed", { error: error.message });
    });
  }, 30000);
}

app.listen(port, () => {
  logEvent("INFO", "service_started", { port, requestId: "startup" });
  registerWithRegistry();
  startHeartbeat();
});
