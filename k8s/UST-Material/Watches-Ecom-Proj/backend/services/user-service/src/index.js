const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
const port = parseInt(process.env.PORT || "8081", 10);
const serviceName = process.env.SERVICE_NAME || "user-service";
const loggingUrl = process.env.LOGGING_URL || "";
const registryUrl = process.env.REGISTRY_URL || "";
const jwtSecret = process.env.JWT_SECRET || "change-me";
const schema = process.env.DB_SCHEMA || "users";

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

async function handleSignup(req, res) {
  const { email, password, displayName } = req.body || {};
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const client = await pool.connect();
    try {
      await client.query(`SET search_path TO ${schema}`);
      await client.query(
        "INSERT INTO users (id, email, password_hash, display_name) VALUES ($1, $2, $3, $4)",
        [id, email, passwordHash, displayName]
      );
    } finally {
      client.release();
    }

    return res.status(201).json({ id, email, displayName });
  } catch (error) {
    await logEvent("ERROR", "signup_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "signup_failed" });
  }
}

app.post("/api/users/signup", handleSignup);
app.post("/signup", handleSignup);

async function handleLogin(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }

  try {
    const client = await pool.connect();
    let user;
    try {
      await client.query(`SET search_path TO ${schema}`);
      const result = await client.query(
        "SELECT id, email, password_hash, display_name FROM users WHERE email = $1",
        [email]
      );
      user = result.rows[0];
    } finally {
      client.release();
    }

    if (!user) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "1h" });
    return res.status(200).json({ token });
  } catch (error) {
    await logEvent("ERROR", "login_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "login_failed" });
  }
}

app.post("/api/users/login", handleLogin);
app.post("/login", handleLogin);

function authMiddleware(req, res, next) {
  const authHeader = req.header("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "missing_token" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.userId;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

async function handleProfile(req, res) {
  try {
    const client = await pool.connect();
    let user;
    try {
      await client.query(`SET search_path TO ${schema}`);
      const result = await client.query(
        "SELECT id, email, display_name FROM users WHERE id = $1",
        [req.userId]
      );
      user = result.rows[0];
    } finally {
      client.release();
    }

    if (!user) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    await logEvent("ERROR", "profile_failed", {
      requestId: req.requestId,
      error: error.message
    });
    return res.status(500).json({ error: "profile_failed" });
  }
}

app.get("/api/users/profile", authMiddleware, handleProfile);
app.get("/profile", authMiddleware, handleProfile);

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
