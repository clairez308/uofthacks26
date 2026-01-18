import React, { useState} from 'react';
import { Button } from "./components/ui/button";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { ProductResults } from './components/ProductResults';

export default function App() {
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState([]); // <-- store API results
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Get API URLs from environment variables, fallback to localhost for development
  const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5001';
  const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5002';

  // Debug: log API URLs (will show if env vars are set)
  console.log('Python API URL:', PYTHON_API_URL);
  console.log('Node API URL:', NODE_API_URL);

  const handleSearch = async (imageDataUrl) => {
    // Validate input
    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      console.error('Invalid imageDataUrl:', typeof imageDataUrl, imageDataUrl);
      alert('No drawing found. Please draw something first.');
      return;
    }

    if (!imageDataUrl.startsWith('data:image/')) {
      console.error('Invalid image data URL format:', imageDataUrl.substring(0, 50));
      alert('Error capturing drawing. Please try again.');
      return;
    }

    setShowResults(false);
    setLoading(true);

    try {
      console.log('Sending image to Python API...', 'Image length:', imageDataUrl.length);
      // Step 1: Send image to Python API to generate query
      const queryRes = await fetch(`${PYTHON_API_URL}/api/image-to-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      if (!queryRes.ok) {
        throw new Error(`Image-to-query failed: ${queryRes.statusText}`);
      }

      const queryData = await queryRes.json();
      if (queryData.error) {
        throw new Error(queryData.error);
      }

      const generatedQuery = queryData.query;
      setQuery(generatedQuery);
      console.log("AI-generated query:", generatedQuery);

      // Step 2: Send query to Node backend to search products
      const searchRes = await fetch(`${NODE_API_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: generatedQuery }),
      });

      if (!searchRes.ok) {
        throw new Error(`Search failed: ${searchRes.statusText}`);
      }

      const searchData = await searchRes.json();

      if (searchData.success) {
        setProducts(searchData.products);
        setShowResults(true);
      } else {
        throw new Error(searchData.error || "Search failed");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert(`Error: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-[#cbd6c6] shadow-sm">
        <div className="px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-50 h-15 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                src="/logo.png"       // <-- path from public folder
                alt="Logo"
                className="w-full h-full object-cover"
                />
            </div>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Drawing Workspace */}
        <div className="w-[40%] border-r border-gray-200 flex flex-col">
          <DrawingCanvas onSearch={handleSearch} />
        </div>

        {/* Right Panel - Product Results */}
        <div className="w-[60%] flex flex-col">
          <ProductResults showResults={showResults} products={products} loading={loading} query={query} />
        </div>
      </div>

    </div>
  );
}