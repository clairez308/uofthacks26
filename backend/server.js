// Import packages
const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const serpAPIService = require('./serpapi-service');
const logger = require('./logger');

// Create the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (processes requests before they reach your routes)
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON data

// Set up file upload handling
const upload = multer({ 
  storage: multer.memoryStorage(), // Store images in memory temporarily
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// ==================== ROUTES ====================

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'Google Shopping Sketch Search API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      search: 'POST /api/search',
      testSearch: 'GET /api/test-search'
    }
  });
});

/**
 * Health check with details
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    serpAPI: process.env.SERPAPI_KEY ? 'configured' : 'using mock data',
    uptime: process.uptime()
  });
});

/**
 * Test endpoint - search Google Shopping with a query string
 * Example: GET /api/test-search?q=backpack
 */
app.get('/api/test-search', async (req, res) => {
  try {
    const query = req.query.q || 'backpack';
    const limit = parseInt(req.query.limit) || 10;
    
    logger.info(`Test search for: "${query}"`);
    
    const products = await serpAPIService.searchProducts(query, limit);
    
    res.json({
      success: true,
      query: query,
      products: products,
      count: products.length
    });
    
  } catch (error) {
    logger.error('Test search failed:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      details: error.message
    });
  }
});

/**
 * Main search endpoint - receives sketch from frontend
 * POST /api/search
 * Body: FormData with 'sketch' image file
 * Optional: 'query' field for search term override
 */
app.post('/api/search', upload.single('sketch'), async (req, res) => {
  try {
    logger.info('📥 Received sketch search request');
    
    // Validate sketch upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No sketch image provided'
      });
    }
    
    logger.info(`📷 Sketch received: ${req.file.size} bytes, type: ${req.file.mimetype}`);
    
    // For now, use a default query
    // Member B will replace this with AI-generated search terms
    const searchQuery = req.body.query || 'product';
    
    logger.info(`🔍 Search query: "${searchQuery}"`);
    
    // Step 1: Member B will generate search terms from sketch
    // For now, we use the provided query or default
    
    // Step 2: Search Google Shopping
    const products = await serpAPIService.searchProducts(searchQuery, 20);
    
    // Step 3: Member B will rank products by similarity to sketch
    // For now, we return products as-is
    
    // Return top matches
    const topMatches = products.slice(0, 12);
    
    logger.success(`✅ Returning ${topMatches.length} products`);
    
    res.json({ 
      success: true, 
      products: topMatches,
      count: topMatches.length,
      query: searchQuery
    });
    
  } catch (error) {
    logger.error('❌ Search error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Search failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  logger.success(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`SerpAPI: ${process.env.SERPAPI_KEY ? 'Active' : 'Mock Mode'}`);
});