const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const health = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed');
    console.log('   Status:', health.data.status);
    console.log('   SerpAPI:', health.data.serpAPI);
    console.log('');
    
    // Test 2: Test Search (no sketch required)
    console.log('Test 2: Test Search with query "backpack"');
    const testSearch = await axios.get(`${BASE_URL}/api/test-search?q=backpack&limit=5`);
    console.log('✅ Test search passed');
    console.log(`   Found ${testSearch.data.count} products`);
    if (testSearch.data.products.length > 0) {
      console.log('   Sample product:', testSearch.data.products[0].title);
      console.log('   Price:', testSearch.data.products[0].price);
    }
    console.log('');
    
    // Test 3: Sketch Search (if test image exists)
    console.log('Test 3: Sketch Search');
    if (fs.existsSync('test-sketch.png')) {
      const form = new FormData();
      form.append('sketch', fs.createReadStream('test-sketch.png'));
      form.append('query', 'backpack'); // Optional query override
      
      const sketchSearch = await axios.post(`${BASE_URL}/api/search`, form, {
        headers: form.getHeaders()
      });
      
      console.log('✅ Sketch search passed');
      console.log(`   Found ${sketchSearch.data.count} products`);
      if (sketchSearch.data.products.length > 0) {
        console.log('   Top result:', sketchSearch.data.products[0].title);
      }
    } else {
      console.log('⚠️  No test-sketch.png found, skipping sketch test');
      console.log('   Create a simple sketch image and save as test-sketch.png to test this endpoint');
    }
    console.log('');
    
    // Test 4: Multiple queries
    console.log('Test 4: Testing different product categories');
    const categories = ['laptop', 'shoes', 'watch'];
    for (const category of categories) {
      const result = await axios.get(`${BASE_URL}/api/test-search?q=${category}&limit=3`);
      console.log(`   ${category}: ${result.data.count} products found`);
    }
    console.log('✅ Category tests passed');
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run tests
runTests();