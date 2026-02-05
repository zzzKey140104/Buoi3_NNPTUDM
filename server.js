const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API_BASE = "https://api.escuelajs.co/api/v1/products";

// Proxy: get products (can accept ?limit & ?offset but defaults to 200)
app.get("/api/products", async (req, res) => {
  try {
    const url = new URL(API_BASE);
    if (req.query.limit) url.searchParams.set("limit", req.query.limit);
    if (req.query.offset) url.searchParams.set("offset", req.query.offset);
    // fallback to a large limit to get all
    if (!req.query.limit) url.searchParams.set("limit", "200");

    const r = await fetch(url.href);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/${req.params.id}`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create product (proxy to external API)
app.post("/api/products", async (req, res) => {
  try {
    const r = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
