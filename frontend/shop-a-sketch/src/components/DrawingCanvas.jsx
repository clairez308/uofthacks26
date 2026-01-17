import { useRef, useEffect, useState } from 'react';
import { Brush, Eraser, Palette, Undo, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

export function DrawingCanvas({ onSearch, showFeedback }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState('brush');
    const [brushSize, setBrushSize] = useState([8]);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [history, setHistory] = useState([]);

    const colors = ['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Draw grid background
        drawGrid(ctx, canvas.width, canvas.height);
    }, []);

    const drawGrid = (ctx, width, height) => {
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;

        const gridSize = 20;
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    };

    const saveHistory = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([...history, imageData]);
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        saveHistory();
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
        }
    };

    const draw = (e) => {
        if (!isDrawing && e.type !== 'mousedown') return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = brushSize[0];
        ctx.lineCap = 'round';

        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        saveHistory();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas.width, canvas.height);
    };

    const handleUndo = () => {
        if (history.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const previousState = history[history.length - 1];
        setHistory(history.slice(0, -1));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas.width, canvas.height);
        ctx.putImageData(previousState, 0, 0);
    };

    async function handleSearch() {
        if (!canvasRef.current) return;
      
        // 1. Get the drawing as base64
        const dataUrl = canvasRef.current.toDataURL("image/png");
      
        try {
          // 2. Send image to backend to generate a query
          const queryRes = await fetch("http://localhost:5001/api/image-to-query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl }),
          });
          const { query, error: queryError } = await queryRes.json();
          if (queryError) throw new Error(queryError);
      
          console.log("AI-generated query:", query);
      
          // 3. Send query to your product search API
          const searchRes = await fetch("http://localhost:5002/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          const data = await searchRes.json();
      
          // 4. Update state with products (assuming you have a setProducts in parent)
          setProducts(data.products);
          setShowResults(true);
        } catch (err) {
          console.error("Search failed:", err);
        }
      }
      

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 mb-4">
                    <Button
                        variant={currentTool === 'brush' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentTool('brush')}
                        className={currentTool === 'brush' ? 'bg-[#008060] hover:bg-[#006e52]' : ''}
                    >
                        <Brush className="h-4 w-4 mr-1" />
                        Brush
                    </Button>

                    <Button
                        variant={currentTool === 'eraser' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentTool('eraser')}
                        className={currentTool === 'eraser' ? 'bg-[#008060] hover:bg-[#006e52]' : ''}
                    >
                        <Eraser className="h-4 w-4 mr-1" />
                        Eraser
                    </Button>

                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                        >
                            <Palette className="h-4 w-4 mr-1" />
                            Color
                            <div
                                className="ml-2 w-5 h-5 rounded border border-gray-300"
                                style={{ backgroundColor: currentColor }}
                            />
                        </Button>

                        {showColorPicker && (
                            <div className="absolute top-full mt-2 left-0 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-[#008060] transition-colors"
                                            style={{ backgroundColor: color }}
                                            onClick={() => {
                                                setCurrentColor(color);
                                                setShowColorPicker(false);
                                            }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={currentColor}
                                    onChange={(e) => setCurrentColor(e.target.value)}
                                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    <Button variant="outline" size="sm" onClick={handleUndo} disabled={history.length === 0}>
                        <Undo className="h-4 w-4 mr-1" />
                        Undo
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleClear}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                </div>

                {/* Brush Size Slider */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 min-w-[80px]">Brush Size:</span>
                    <Slider
                        value={brushSize}
                        onValueChange={setBrushSize}
                        min={1}
                        max={50}
                        step={1}
                        className="flex-1"
                    />
                    <span className="text-sm text-gray-600 min-w-[40px]">{brushSize[0]}px</span>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-white">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />

                {/* AI Feedback Bubble */}
                {showFeedback && (
                    <div className="absolute top-4 left-4 bg-[#008060] text-white px-4 py-2 rounded-lg shadow-lg max-w-[200px]">
                        <p className="text-sm font-medium">Looks like a chair! 🪑</p>
                    </div>
                )}
            </div>

            {/* Search Button */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <Button
                    onClick={onSearch}
                    className="w-full bg-[#008060] hover:bg-[#006e52] text-white font-medium"
                    size="lg"
                >
                    Search Products
                </Button>
            </div>
        </div>
    );
}
