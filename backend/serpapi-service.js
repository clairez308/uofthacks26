// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { getJson } = require('serpapi');

const app = express();
const upload = multer({ dest: 'uploads/' });

// ------------------- SerpAPI Service -------------------
class SerpAPIService {
  constructor() {
    this.apiKey = process.env.SERPAPI_KEY;

    if (!this.apiKey) {
      console.warn('⚠️  No SerpAPI key found - using mock data');
      this.useMockData = true;
    } else {
      console.log('✅ SerpAPI configured');
      this.useMockData = false;
    }
  }

  async searchProducts(query, limit = 20) {
    if (this.useMockData) {
      return this.getMockProducts(query);
    }

    try {
      console.log(`🔍 Searching Google Shopping for: "${query}"`);

      const response = await getJson({
        engine: "google_shopping",
        api_key: this.apiKey,
        q: query,
        num: limit,
        location: "United States",
        include_offers: true
      });

      if (!response.shopping_results || response.shopping_results.length === 0) {
        console.log('⚠️  No results found, using mock data');
        return this.getMockProducts(query);
      }

      const products = response.shopping_results.map((item, index) => {
        let merchantUrl = '#';
        if (item.offers && Array.isArray(item.offers) && item.offers.length > 0) {
          merchantUrl = item.offers[0].link || merchantUrl;
        } else if (item.link) {
          merchantUrl = item.link;
        }

        return {
          id: item.product_id || `product-${index}`,
          title: item.title,
          description: item.snippet || item.title,
          price: item.extracted_price || item.price || '0.00',
          currency: item.currency || 'USD',
          image: item.thumbnail || '',
          url: merchantUrl,
          source: item.source || 'Unknown',
          rating: item.rating || null,
          reviews: item.reviews || null,
          delivery: item.delivery || null
        };
      });

      console.log(`✅ Found ${products.length} products`);
      return products;

    } catch (error) {
      console.error('❌ SerpAPI Error:', error.toString());
      return this.getMockProducts(query);
    }
  }

  getMockProducts(query = 'general') {
    return [
      {
        id: 'mock-1',
        title: 'Mock Product 1',
        description: 'Mock description',
        price: '9.99',
        currency: 'USD',
        image: 'https://via.placeholder.com/400x400',
        url: 'https://example.com/mock1',
        source: 'Mock Store',
        rating: 4.5,
        reviews: 100,
        delivery: null
      },
      {
        id: 'mock-2',
        title: 'Mock Product 2',
        description: 'Mock description',
        price: '19.99',
        currency: 'USD',
        image: 'https://via.placeholder.com/400x400',
        url: 'https://example.com/mock2',
        source: 'Mock Store',
        rating: 4.8,
        reviews: 50,
        delivery: null
      }
    ];
  }
}

const serpAPIService = new SerpAPIService();

// ------------------- Routes -------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Sketch-to-query endpoint (mock AI query)
app.post('/api/image-to-query', upload.single('image'), (req, res) => {
  console.log('📥 Received image-to-query request');
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  // Mock AI query
  const query = 'white short sleeve t-shirt with blue cat graphic';
  res.json({ query });
});

// Search endpoint
app.post('/api/search', upload.single('sketch'), async (req, res) => {
  console.log('📥 Received search request');
  if (!req.file || !req.body.query) return res.status(400).json({ error: 'Missing sketch or query' });

  const query = req.body.query;
  console.log(`🔍 Searching for query: "${query}"`);

  const products = await serpAPIService.searchProducts(query, 20);

  res.json({
    success: true,
    query,
    count: products.length,
    products
  });
});

// ------------------- Server -------------------
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
