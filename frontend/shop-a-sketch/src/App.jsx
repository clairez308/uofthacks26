import { useState } from 'react';
import { Settings, User, Share2, Clock } from 'lucide-react';
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { ProductResults } from './components/ProductResults';

export default function App() {
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [products, setProducts] = useState([]); // <-- store API results
  const [loading, setLoading] = useState(false);

  const handleSearch = async(query) => {
    setShowResults(true);
    setShowFeedback(true);
    setLoading(true);

    try {
        const res = await fetch("http://localhost:5002/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }), // <-- send the query
        });
  
        const data = await res.json();
  
        if (data.success) {
          setProducts(data.products); // <-- store products in state
          setShowResults(true);
        } else {
          console.error("Search failed:", data.error);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
  };
  

  const drawingHistory = [
    { id: 1, label: 'Chair sketch', time: '2 min ago' },
    { id: 2, label: 'Lamp design', time: '15 min ago' },
    { id: 3, label: 'Desk drawing', time: '1 hour ago' },
  ];

  return (
    <div className="h-screen flex flex-col bg-white" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#008060] rounded-lg flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 15L9 9L13 13L21 5"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 11V5H15"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sketch2Shop</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
            <Avatar className="h-9 w-9 border-2 border-[#008060]">
              <AvatarFallback className="bg-[#008060] text-white font-semibold">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Drawing Workspace */}
        <div className="w-[40%] border-r border-gray-200 flex flex-col">
          <DrawingCanvas onSearch={handleSearch} showFeedback={showFeedback} />
        </div>

        {/* Right Panel - Product Results */}
        <div className="w-[60%] flex flex-col">
          <ProductResults showResults={showResults} products={products} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Recent:</span>
            </div>
            <div className="flex gap-2">
              {drawingHistory.map((item) => (
                <button
                  key={item.id}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
                >
                  {item.label}
                  <span className="ml-2 text-gray-500">{item.time}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-[#008060] text-[#008060] hover:bg-[#008060] hover:text-white"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </footer>
    </div>
  );
}