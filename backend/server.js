require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.json({ status: "Server running" });
});

/* ===============================
   SEARCH ENDPOINT
================================ */
app.post("/api/search", upload.single("sketch"), async (req, res) => {
  try {
    const query = req.body.query;

    if (!query) {
      return res.status(400).json({ error: "Query missing" });
    }

    console.log("🔍 Searching for:", query);

    const serpRes = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_shopping",
        q: query,
        hl: "en",
        gl: "us",
        api_key: SERPAPI_KEY
      }
    });

    const items = serpRes.data.shopping_results || [];

    const products = items.map(item => {
      // Prefer product_link, fallback to SerpApi product URL
      let rawUrl = item.link || item.product_link || (item.product_id
        ? `https://www.google.com/shopping/product/${item.product_id}`
        : "#");

      // Encode the URL so spaces and special characters don't break it
      const fixedUrl = rawUrl ? encodeURI(rawUrl) : "#";

      return {
        id: item.product_id || item.position,
        title: item.title,
        description: item.snippet || item.title,
        price: item.price ? parseFloat(item.price.replace(/[^0-9.]/g, "")) : null,
        currency: "USD",
        image: item.thumbnail,
        url: fixedUrl,
        source: item.source,
        rating: item.rating || null,
        reviews: item.reviews || null
      };
    });

    res.json({
      success: true,
      query,
      count: products.length,
      products
    });
  } catch (err) {
    console.error("❌ ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
