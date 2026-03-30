const express = require("express");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
const port = parseInt(process.env.PORT || "8085", 10);
const serviceName = process.env.SERVICE_NAME || "review-service";
const loggingUrl = process.env.LOGGING_URL || "";
const registryUrl = process.env.REGISTRY_URL || "";
const schema = process.env.DB_SCHEMA || "reviews";

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

app.post("/api/reviews", async (req, res) => {
  const { userId, productId, rating, comment } = req.body || {};
  if (!userId || !productId || !rating) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const id = uuidv4();
    const client = await pool.connect();
    try {
      await client.query(`SET search_path TO ${schema}`);
      await client.query(
        "INSERT INTO reviews (id, user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
        [id, userId, productId, rating, comment || null]
      );
    } finally {
      client.release();
    }

    return res.status(201).json({ id, userId, productId, rating, comment });
  } catch (error) {
    await logEvent("ERROR", "create_review_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "create_review_failed" });
  }
});

app.get("/api/reviews", async (req, res) => {
  const { productId } = req.query || {};
  if (!productId) {
    return res.status(400).json({ error: "missing_product_id" });
  }

  try {
    const client = await pool.connect();
    let result;
    try {
      await client.query(`SET search_path TO ${schema}`);
      result = await client.query(
        "SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC",
        [productId]
      );
    } finally {
      client.release();
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    await logEvent("ERROR", "list_reviews_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "list_reviews_failed" });
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
