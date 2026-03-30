const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = parseInt(process.env.PORT || "8080", 10);
const registryUrl = process.env.REGISTRY_URL || "";
const loggingUrl = process.env.LOGGING_URL || "";

const routeMap = [
  { prefix: "/api/users", service: "user-service" },
  { prefix: "/api/products", service: "product-service" },
  { prefix: "/api/cart", service: "cart-service" },
  { prefix: "/api/orders", service: "order-service" },
  { prefix: "/api/reviews", service: "review-service" }
];

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
});

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
    service: "api-gateway",
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
        service: "api-gateway",
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

async function resolveServiceTarget(serviceName) {
  if (!registryUrl) {
    return null;
  }

  const response = await axios.get(`${registryUrl}/services`, {
    params: { name: serviceName },
    timeout: 1500
  });

  const instances = response.data.instances || [];
  if (!instances.length) {
    return null;
  }

  const instance = instances[0];
  return `http://${instance.host}:${instance.port}`;
}

routeMap.forEach(({ prefix, service }) => {
  app.use(prefix, async (req, res) => {
    let target;
    try {
      target = await resolveServiceTarget(service);
    } catch (error) {
      await logEvent("ERROR", "service_discovery_failed", {
        requestId: req.requestId,
        service,
        error: error.message
      });
      return res.status(503).json({ error: "service_unavailable" });
    }

    if (!target) {
      return res.status(503).json({ error: "service_unavailable" });
    }

    const url = `${target}${req.originalUrl}`;

    // Forward all headers except host
    const forwardHeaders = Object.assign({}, req.headers);
    delete forwardHeaders["host"];
    forwardHeaders["x-request-id"] = req.requestId;

    try {
      const serviceRes = await axios({
        method: req.method,
        url,
        headers: forwardHeaders,
        data: ["GET", "HEAD", "DELETE"].includes(req.method.toUpperCase()) ? undefined : req.body,
        timeout: 10000,
        validateStatus: () => true,
        responseType: "json",
        maxRedirects: 0,
      });

      res.status(serviceRes.status);
      Object.entries(serviceRes.headers || {}).forEach(([k, v]) => {
        if (!["transfer-encoding", "connection"].includes(k.toLowerCase())) {
          res.setHeader(k, v);
        }
      });
      return res.json(serviceRes.data);
    } catch (error) {
      await logEvent("ERROR", "proxy_error", {
        requestId: req.requestId,
        service,
        error: error.message
      });
      return res.status(502).json({ error: "bad_gateway" });
    }
  });
});

app.listen(port, () => {
  logEvent("INFO", "service_started", { port, requestId: "startup" });
});
