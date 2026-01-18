import { useRef, useEffect, useState, useCallback } from 'react';
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

    const lastPos = useRef({ x: 0, y: 0 });
    const gridCanvasRef = useRef(null);
    const colorPickerRef = useRef(null); // Ref for color picker panel

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                colorPickerRef.current &&
                !colorPickerRef.current.contains(event.target) &&
                !event.target.closest('[data-color-button]') // Don't close if clicking the color button itself
            ) {
                setShowColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const drawGrid = useCallback((ctx, width, height) => {
        if (!ctx) return;

        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        const gridSize = 20;

        ctx.clearRect(0, 0, width, height);

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
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gridCanvas = gridCanvasRef.current;
        if (!canvas || !gridCanvas) return;

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        canvas.width = width;
        canvas.height = height;
        gridCanvas.width = width;
        gridCanvas.height = height;

        const ctx = canvas.getContext('2d');
        const gridCtx = gridCanvas.getContext('2d');
        if (!ctx || !gridCtx) return;

        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, width, height);
        drawGrid(gridCtx, width, height);
    }, [drawGrid]);

    const saveHistory = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([...history, imageData]);
    };

    const startDrawing = (e) => {
        // Don't start drawing if color picker is open
        if (showColorPicker) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        lastPos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        setIsDrawing(true);
        saveHistory();
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
        // Don't draw if color picker is open
        if (showColorPicker) return;
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = brushSize[0];
        ctx.lineCap = 'round';

        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = '#FFFFFF';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
        }

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastPos.current = { x, y };
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        saveHistory();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const handleUndo = () => {
        if (history.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const previousState = history[history.length - 1];
        setHistory(history.slice(0, -1));

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(previousState, 0, 0);
    };

    // ... rest of the functions remain the same

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
                            data-color-button
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
                            <div
                                ref={colorPickerRef}
                                className="absolute top-full mt-2 left-0 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-20"
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseMove={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-[#008060] transition-colors cursor-pointer"
                                            style={{ backgroundColor: color }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setCurrentColor(color);
                                                setShowColorPicker(false);
                                            }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={currentColor}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setCurrentColor(e.target.value);
                                        setShowColorPicker(false);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
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

            {/* Canvas Area with layered canvases */}
            <div className="flex-1 relative bg-white">
                {/* Grid canvas (background layer) */}
                <canvas
                    ref={gridCanvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />

                {/* Drawing canvas (top layer) */}
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{
                        pointerEvents: showColorPicker ? 'none' : 'auto'
                    }}
                />
            </div>

            {/* Search Button */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!canvasRef.current) {
                            console.error('Canvas not found');
                            return;
                        }
                        try {
                            const dataUrl = canvasRef.current.toDataURL("image/png");
                            if (!dataUrl || dataUrl === 'data:,') {
                                alert('Please draw something first');
                                return;
                            }
                            console.log('Canvas image captured, length:', dataUrl.length);
                            if (onSearch && typeof onSearch === 'function') {
                                onSearch(dataUrl);
                            } else {
                                console.error('onSearch is not a function:', typeof onSearch);
                            }
                        } catch (error) {
                            console.error('Error capturing canvas:', error);
                            alert('Error capturing drawing. Please try again.');
                        }
                    }}
                    className="w-full bg-[#008060] hover:bg-[#006e52] text-white font-medium"
                    size="lg"
                >
                    Search Products
                </Button>
            </div>
        </div>
    );
}