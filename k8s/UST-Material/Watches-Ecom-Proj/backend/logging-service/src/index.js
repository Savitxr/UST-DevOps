const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/logs", (req, res) => {
  const entry = req.body || {};
  const normalized = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    level: entry.level || "INFO",
    service: entry.service || "unknown",
    requestId: entry.requestId || "unknown",
    message: entry.message || "",
    meta: entry.meta || {}
  };

  console.log(JSON.stringify(normalized));
  res.status(202).json({ accepted: true });
});

app.listen(port, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "INFO",
    service: "logging-service",
    message: `listening on ${port}`
  }));
});
