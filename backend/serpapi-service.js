const { getJson } = require('serpapi');
const logger = require('./logger'); 

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
  
  /**
   * Search Google Shopping for products
   * @param {string} query - Search query (e.g., "backpack", "lamp", "coffee mug")
   * @param {number} limit - Number of results to return
   * @returns {Array} - Array of product objects
   */
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
        location: "United States"
      });
      
      if (!response.shopping_results || response.shopping_results.length === 0) {
        console.log('⚠️  No results found, using mock data');
        return this.getMockProducts(query);
      }
      
      // Transform SerpAPI results to our format
      const products = response.shopping_results.map((item, index) => ({
        id: item.product_id || `product-${index}`,
        title: item.title,
        description: item.snippet || item.title,
        price: item.extracted_price || item.price || '0.00',
        currency: item.currency || 'USD',
        image: item.thumbnail || '',
        url: item.link || '#',
        source: item.source || 'Unknown',
        rating: item.rating || null,
        reviews: item.reviews || null,
        delivery: item.delivery || null
      }));
      
      console.log(`✅ Found ${products.length} products from Google Shopping`);
      return products;
      
    } catch (error) {
        console.error('❌ SerpAPI Error status:', error.response?.status);
        console.error('❌ SerpAPI Error data:', error.response?.data);
        console.error('❌ Full error:', error.toString());
        return this.getMockProducts(query);
      }
      
  }
  
  /**
   * Search for multiple queries and combine results
   * Useful when AI suggests multiple product categories
   */
  async searchMultipleQueries(queries, resultsPerQuery = 10) {
    const allResults = [];
    
    for (const query of queries) {
      const results = await this.searchProducts(query, resultsPerQuery);
      allResults.push(...results);
    }
    
    // Remove duplicates based on product_id
    const uniqueProducts = Array.from(
      new Map(allResults.map(item => [item.id, item])).values()
    );
    
    return uniqueProducts;
  }
  
  /**
   * Mock products for testing without API calls
   */
  getMockProducts(query = 'general') {
    const mockData = {
      'backpack': [
        {
          id: 'mock-1',
          title: 'Classic Canvas Backpack - Vintage Style',
          description: 'Durable canvas backpack perfect for daily use',
          price: '49.99',
          currency: 'USD',
          image: 'https://via.placeholder.com/400x400?text=Canvas+Backpack',
          url: 'https://example.com/backpack-1',
          source: 'Mock Store',
          rating: 4.5,
          reviews: 1234
        },
        {
          id: 'mock-2',
          title: 'Modern Laptop Backpack - Water Resistant',
          description: 'Water-resistant backpack with laptop compartment',
          price: '79.99',
          currency: 'USD',
          image: 'https://via.placeholder.com/400x400?text=Laptop+Backpack',
          url: 'https://example.com/backpack-2',
          source: 'Mock Store',
          rating: 4.8,
          reviews: 856
        }
      ],
      'lamp': [
        {
          id: 'mock-3',
          title: 'Modern Desk Lamp - Adjustable LED',
          description: 'LED desk lamp with adjustable brightness',
          price: '39.99',
          currency: 'USD',
          image: 'https://via.placeholder.com/400x400?text=Desk+Lamp',
          url: 'https://example.com/lamp-1',
          source: 'Mock Store',
          rating: 4.6,
          reviews: 432
        },
        {
          id: 'mock-4',
          title: 'Vintage Table Lamp - Edison Bulb',
          description: 'Industrial style lamp with Edison bulb',
          price: '59.99',
          currency: 'USD',
          image: 'https://via.placeholder.com/400x400?text=Vintage+Lamp',
          url: 'https://example.com/lamp-2',
          source: 'Mock Store',
          rating: 4.7,
          reviews: 678
        }
      ],
      'general': [
        {
          id: 'mock-5',
          title: 'Wireless Bluetooth Headphones',
          description: 'Noise-cancelling over-ear headphones',
          price: '129.99',
          currency: 'USD',
          image: 'https://via.placeholder.com/400x400?text=Headphones',
          url: 'https://example.com/headphones',
          source: 'Mock Store',
          rating: 4.4,
          reviews: 2341
        },
        {
          id: 'mock-6',
          title: 'Stainless Steel Water Bottle',
          description: 'Insulated bottle keeps drinks cold for 24hrs',
          price: '24.99',
          currency: 'USD',
          image: 'https://via.placeholder.com/400x400?text=Water+Bottle',
          url: 'https://example.com/bottle',
          source: 'Mock Store',
          rating: 4.9,
          reviews: 5432
        },
        {
          id: 'mock-7',
          title: 'Yoga Mat - Non-Slip Premium',
          description: 'Extra thick yoga mat with carrying strap',
          price: '34.99',
          currency: 'USD',
          image: 'https://via.placeholder.com/400x400?text=Yoga+Mat',
          url: 'https://example.com/yoga-mat',
          source: 'Mock Store',
          rating: 4.7,
          reviews: 891
        }
      ]
    };
    
    // Return mock data for the query, or general if not found
    return mockData[query.toLowerCase()] || mockData['general'];
  }
}

module.exports = new SerpAPIService();