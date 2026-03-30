const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = parseInt(process.env.PORT || "8761", 10);
const ttlMs = parseInt(process.env.REGISTRY_TTL_MS || "90000", 10);

const registry = new Map();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

function upsertInstance(serviceName, host, portNumber) {
  const key = `${host}:${portNumber}`;
  const now = Date.now();
  if (!registry.has(serviceName)) {
    registry.set(serviceName, new Map());
  }
  registry.get(serviceName).set(key, {
    id: uuidv4(),
    host,
    port: portNumber,
    lastSeen: now
  });
}

app.post(["/register", "/heartbeat"], (req, res) => {
  const { serviceName, host, port: portNumber } = req.body || {};
  if (!serviceName || !host || !portNumber) {
    return res.status(400).json({ error: "missing_fields" });
  }

  upsertInstance(serviceName, host, Number(portNumber));
  return res.status(200).json({ status: "ok" });
});

app.get("/services", (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ error: "missing_name" });
  }

  const services = registry.get(name) || new Map();
  const now = Date.now();
  const instances = Array.from(services.values()).filter((entry) => now - entry.lastSeen <= ttlMs);

  return res.status(200).json({ instances });
});

setInterval(() => {
  const now = Date.now();
  registry.forEach((instances, serviceName) => {
    instances.forEach((entry, key) => {
      if (now - entry.lastSeen > ttlMs) {
        instances.delete(key);
      }
    });
    if (instances.size === 0) {
      registry.delete(serviceName);
    }
  });
}, Math.min(ttlMs, 30000));

app.listen(port, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "INFO",
    service: "registry-service",
    message: `listening on ${port}`
  }));
});
