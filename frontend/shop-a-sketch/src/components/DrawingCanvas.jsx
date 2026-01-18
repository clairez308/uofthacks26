import { useRef, useEffect, useState, useCallback } from 'react';
import { Brush, Eraser, Palette, Undo, Trash2, PaintBucket } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

export function DrawingCanvas({ onSearch }) {
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

    // Helper function to get coordinates from mouse or touch event
    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
        const clientY = e.touches ? e.touches[0].clientY : (e.changedTouches ? e.changedTouches[0].clientY : e.clientY);
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const gridCanvas = gridCanvasRef.current;
            if (!canvas || !gridCanvas) return;

            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            // Account for device pixel ratio for crisp rendering on mobile
            const dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            gridCanvas.width = width * dpr;
            gridCanvas.height = height * dpr;

            // Scale context to match device pixel ratio
            const ctx = canvas.getContext('2d');
            const gridCtx = gridCanvas.getContext('2d');
            if (!ctx || !gridCtx) return;

            ctx.scale(dpr, dpr);
            gridCtx.scale(dpr, dpr);

            ctx.fillStyle = 'rgba(255, 255, 255, 0)';
            ctx.fillRect(0, 0, width, height);
            drawGrid(gridCtx, width, height);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('orientationchange', resizeCanvas);
        };
    }, [drawGrid]);

    const saveHistory = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([...history, imageData]);
    };

    // Flood fill algorithm (bucket/fill tool)
    const floodFill = (ctx, startX, startY, fillColor) => {
        const canvas = canvasRef.current;
        if (!canvas || !ctx) return;

        // Account for device pixel ratio - coordinates are in CSS space, but canvas is scaled
        const dpr = window.devicePixelRatio || 1;
        const scaledX = startX * dpr;
        const scaledY = startY * dpr;

        // Get image data at full resolution
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Convert hex color to RGBA
        const hexToRgba = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b, 255];
        };

        const [fillR, fillG, fillB, fillA] = hexToRgba(fillColor);
        
        // Get the color at the starting point (using scaled coordinates)
        const startIndex = ((Math.floor(scaledY) * width) + Math.floor(scaledX)) * 4;
        const targetR = data[startIndex];
        const targetG = data[startIndex + 1];
        const targetB = data[startIndex + 2];
        const targetA = data[startIndex + 3];

        // Check if we're already filling with the same color
        if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) {
            return;
        }

        // Stack-based flood fill (using scaled coordinates)
        const stack = [[Math.floor(scaledX), Math.floor(scaledY)]];
        const visited = new Set();

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;

            if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) {
                continue;
            }

            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            // Check if pixel matches target color (within tolerance for transparency)
            if (r === targetR && g === targetG && b === targetB && a === targetA) {
                visited.add(key);
                
                // Set pixel to fill color
                data[index] = fillR;
                data[index + 1] = fillG;
                data[index + 2] = fillB;
                data[index + 3] = fillA;

                // Add neighbors to stack
                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }
        }

        // Put the modified image data back
        ctx.putImageData(imageData, 0, 0);
    };

    const startDrawing = (e) => {
        // Don't start drawing if color picker is open
        if (showColorPicker) return;

        // Prevent default to avoid scrolling on touch devices
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCoordinates(e);

        // Handle fill tool
        if (currentTool === 'fill') {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            saveHistory();
            floodFill(ctx, x, y, currentColor);
            return;
        }

        lastPos.current = { x, y };
        setIsDrawing(true);
        saveHistory();
    };

    const stopDrawing = (e) => {
        if (e) {
            e.preventDefault();
        }
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

        // Prevent default to avoid scrolling on touch devices
        e.preventDefault();

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { x, y } = getCoordinates(e);

        ctx.lineWidth = brushSize[0];
        ctx.lineCap = 'round';

        if (currentTool === 'eraser') {
            // Eraser should make pixels transparent, not draw white
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)'; // Color doesn't matter for destination-out
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
                <div className="flex items-center gap-1.5 sm:gap-2 mb-4">
                    <Button
                        variant={currentTool === 'brush' && !showColorPicker ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                            setCurrentTool('brush');
                            setShowColorPicker(false);
                        }}
                        className={`${currentTool === 'brush' && !showColorPicker ? 'bg-[#008060] hover:bg-[#006e52]' : ''} text-xs px-2 py-1.5 h-8`}
                    >
                        <Brush className="h-3.5 w-3.5 mr-1" />
                        Brush
                    </Button>

                    <Button
                        variant={currentTool === 'eraser' && !showColorPicker ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                            setCurrentTool('eraser');
                            setShowColorPicker(false);
                        }}
                        className={`${currentTool === 'eraser' && !showColorPicker ? 'bg-[#008060] hover:bg-[#006e52]' : ''} text-xs px-2 py-1.5 h-8`}
                    >
                        <Eraser className="h-3.5 w-3.5 mr-1" />
                        Eraser
                    </Button>

                    <Button
                        variant={currentTool === 'fill' && !showColorPicker ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                            setCurrentTool('fill');
                            setShowColorPicker(false);
                        }}
                        className={`${currentTool === 'fill' && !showColorPicker ? 'bg-[#008060] hover:bg-[#006e52]' : ''} text-xs px-2 py-1.5 h-8`}
                    >
                        <PaintBucket className="h-3.5 w-3.5 mr-1" />
                        Fill
                    </Button>

                    <div className="relative">
                        <Button
                            data-color-button
                            variant={showColorPicker ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`text-xs px-2 py-1.5 h-8 ${showColorPicker ? 'bg-[#008060] hover:bg-[#006e52]' : ''}`}
                        >
                            <Palette className="h-3.5 w-3.5 mr-1" />
                            Colour
                            <div
                                className="ml-1.5 w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: currentColor }}
                            />
                        </Button>

                        {showColorPicker && (
                            <div
                                ref={colorPickerRef}
                                className="absolute top-full mt-2 left-0 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-20"
                                onMouseDown={(e) => {
                                    // Only stop propagation if not clicking on color input
                                    if (e.target.type !== 'color') {
                                        e.stopPropagation();
                                    }
                                }}
                                onClick={(e) => {
                                    // Only stop propagation if not clicking on color input
                                    if (e.target.type !== 'color') {
                                        e.stopPropagation();
                                    }
                                }}
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
                                        setCurrentColor(e.target.value);
                                        // Don't close picker when dragging, only on blur
                                    }}
                                    onBlur={() => {
                                        // Close picker when user clicks away
                                        setTimeout(() => setShowColorPicker(false), 200);
                                    }}
                                    className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    <Button variant="outline" size="sm" onClick={handleUndo} disabled={history.length === 0} className="text-xs px-2 py-1.5 h-8">
                        <Undo className="h-3.5 w-3.5 mr-1" />
                        Undo
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleClear} className="text-xs px-2 py-1.5 h-8">
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
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
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
                    style={{
                        pointerEvents: showColorPicker ? 'none' : 'auto',
                        touchAction: 'none' // Prevent scrolling/zooming on touch devices
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
                            const drawingCanvas = canvasRef.current;
                            if (!drawingCanvas) {
                                alert('Canvas not found. Please refresh the page.');
                                return;
                            }

                            // Check if canvas has any drawing content
                            const ctx = drawingCanvas.getContext('2d');
                            const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
                            const pixels = imageData.data;
                            let hasContent = false;
                            
                            // Check if there are any non-transparent pixels
                            for (let i = 3; i < pixels.length; i += 4) {
                                if (pixels[i] > 0) { // Alpha channel > 0 means there's content
                                    hasContent = true;
                                    break;
                                }
                            }

                            if (!hasContent) {
                                alert('Please draw something first before searching.');
                                return;
                            }

                            // Create a temporary canvas with white background (excludes grid)
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = drawingCanvas.width;
                            tempCanvas.height = drawingCanvas.height;
                            const tempCtx = tempCanvas.getContext('2d');
                            
                            // Fill with white background
                            tempCtx.fillStyle = '#FFFFFF';
                            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                            
                            // Draw only the drawing canvas content (not the grid) onto white background
                            tempCtx.drawImage(drawingCanvas, 0, 0);
                            
                            // Convert to data URL (now it's just the drawing on white, no grid)
                            const dataUrl = tempCanvas.toDataURL("image/png");
                            
                            if (!dataUrl || dataUrl === 'data:,') {
                                alert('Error capturing drawing. Please try again.');
                                return;
                            }
                            
                            console.log('Canvas image captured (drawing only, no grid), length:', dataUrl.length);
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