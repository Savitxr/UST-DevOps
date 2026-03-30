const express = require("express");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
const port = parseInt(process.env.PORT || "8082", 10);
const serviceName = process.env.SERVICE_NAME || "product-service";
const loggingUrl = process.env.LOGGING_URL || "";
const registryUrl = process.env.REGISTRY_URL || "";
const schema = process.env.DB_SCHEMA || "products";

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

app.get("/api/products", async (req, res) => {
  const { brand, category, sellerId } = req.query;
  try {
    const client = await pool.connect();
    let result;
    try {
      await client.query(`SET search_path TO ${schema}`);
      const filters = [];
      const values = [];
      if (brand) {
        values.push(brand);
        filters.push(`brand = $${values.length}`);
      }
      if (category) {
        values.push(category);
        filters.push(`category = $${values.length}`);
      }
      if (sellerId) {
        values.push(sellerId);
        filters.push(`seller_id = $${values.length}`);
      }
      const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
      result = await client.query(`SELECT * FROM watches ${where} ORDER BY created_at DESC`, values);
    } finally {
      client.release();
    }
    return res.status(200).json(result.rows);
  } catch (error) {
    await logEvent("ERROR", "list_products_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "list_products_failed" });
  }
});

app.post("/api/products", async (req, res) => {
  const { name, brand, category, priceCents, sellerId, condition, description } = req.body || {};
  if (!name || !brand || !category || !priceCents) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const id = uuidv4();
    const client = await pool.connect();
    try {
      await client.query(`SET search_path TO ${schema}`);
      await client.query(
        "INSERT INTO watches (id, seller_id, name, brand, category, condition, description, price_cents) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [id, sellerId || null, name, brand, category, condition || null, description || null, priceCents]
      );
    } finally {
      client.release();
    }

    return res.status(201).json({ id, sellerId, name, brand, category, condition, description, priceCents });
  } catch (error) {
    await logEvent("ERROR", "create_product_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "create_product_failed" });
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
