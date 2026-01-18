import { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

// const productsFromAPI = products.map((p) => ({
//     id: p.id,
//     title: p.title,
//     image: p.image,
//     price: p.price,
//     store: p.source,
//     url: p.url,
//     rating: p.rating,
//     reviews: p.reviews,
//   }));
  

export function ProductResults({ showResults, products, loading = false, query = '' }) {
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedFilters, setSelectedFilters] = useState({
        materials: [],
        colors: [],
        styles: []
    });

    // Common attribute keywords to look for
    const materialKeywords = [
        'wood', 'wooden', 'metal', 'steel', 'aluminum', 'plastic', 'fabric', 'cotton', 
        'leather', 'synthetic', 'glass', 'ceramic', 'bamboo', 'rattan', 'wicker',
        'marble', 'stone', 'granite', 'canvas', 'velvet', 'suede', 'polyester'
    ];
    
    const colorKeywords = [
        'black', 'white', 'red', 'blue', 'green', 'yellow', 'brown', 'gray', 'grey',
        'beige', 'tan', 'cream', 'ivory', 'navy', 'pink', 'purple', 'orange', 'silver',
        'gold', 'bronze', 'copper', 'walnut', 'oak', 'mahogany', 'cherry', 'espresso'
    ];
    
    const styleKeywords = [
        'modern', 'contemporary', 'vintage', 'classic', 'traditional', 'minimalist',
        'industrial', 'rustic', 'scandinavian', 'bohemian', 'mid-century', 'retro',
        'luxury', 'premium', 'casual', 'elegant', 'sleek'
    ];

    // Extract dynamic filters - prioritize query first, then check products
    const dynamicFilters = useMemo(() => {
        if (!products || products.length === 0) {
            return { materials: [], colors: [], styles: [] };
        }

        const queryLower = query.toLowerCase();
        const foundMaterials = new Map(); // Use Map to track relevance score
        const foundColors = new Map();
        const foundStyles = new Map();

        // First pass: Extract filters from query (high priority)
        const queryFilters = {
            materials: new Set(),
            colors: new Set(),
            styles: new Set()
        };

        materialKeywords.forEach(keyword => {
            if (queryLower.includes(keyword)) {
                queryFilters.materials.add(keyword);
                foundMaterials.set(keyword, 2); // Higher score for query matches
            }
        });

        colorKeywords.forEach(keyword => {
            if (queryLower.includes(keyword)) {
                queryFilters.colors.add(keyword);
                foundColors.set(keyword, 2);
            }
        });

        styleKeywords.forEach(keyword => {
            if (queryLower.includes(keyword)) {
                queryFilters.styles.add(keyword);
                foundStyles.set(keyword, 2);
            }
        });

        // Second pass: Extract from products, but only if:
        // 1. Already in query (already added above), OR
        // 2. Contextually relevant to the query AND appears in multiple products
        const productCounts = {
            materials: new Map(),
            colors: new Map(),
            styles: new Map()
        };

        products.forEach(product => {
            const text = `${product.title} ${product.description || ''}`.toLowerCase();
            
            materialKeywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    productCounts.materials.set(keyword, (productCounts.materials.get(keyword) || 0) + 1);
                }
            });

            colorKeywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    productCounts.colors.set(keyword, (productCounts.colors.get(keyword) || 0) + 1);
                }
            });

            styleKeywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    productCounts.styles.set(keyword, (productCounts.styles.get(keyword) || 0) + 1);
                }
            });
        });

        // Only include product filters if:
        // - They're already in the query, OR
        // - They appear in at least 2 products (to filter out noise)
        productCounts.materials.forEach((count, keyword) => {
            if (queryFilters.materials.has(keyword)) {
                // Already added from query
                return;
            }
            // Only add if it appears in multiple products (more relevant)
            if (count >= 2) {
                foundMaterials.set(keyword, 1);
            }
        });

        productCounts.colors.forEach((count, keyword) => {
            if (queryFilters.colors.has(keyword)) {
                return;
            }
            if (count >= 2) {
                foundColors.set(keyword, 1);
            }
        });

        productCounts.styles.forEach((count, keyword) => {
            if (queryFilters.styles.has(keyword)) {
                return;
            }
            if (count >= 2) {
                foundStyles.set(keyword, 1);
            }
        });

        // Sort by relevance (query matches first), then alphabetically
        const sortFilters = (map) => {
            return Array.from(map.keys())
                .sort((a, b) => {
                    const scoreA = map.get(a);
                    const scoreB = map.get(b);
                    if (scoreA !== scoreB) {
                        return scoreB - scoreA; // Higher score first
                    }
                    return a.localeCompare(b); // Then alphabetical
                });
        };

        return {
            materials: sortFilters(foundMaterials),
            colors: sortFilters(foundColors),
            styles: sortFilters(foundStyles)
        };
    }, [products, query]);

    // Toggle filter selection
    const toggleFilter = (category, value) => {
        setSelectedFilters(prev => {
            const current = prev[category] || [];
            const newSelection = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: newSelection };
        });
    };

    const filteredProducts = products.filter((product) => {
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        
        if (!matchesPrice) return false;

        const text = `${product.title} ${product.description || ''}`.toLowerCase();
        
        // Check material filters
        if (selectedFilters.materials.length > 0) {
            const hasMaterial = selectedFilters.materials.some(material => 
                text.includes(material)
            );
            if (!hasMaterial) return false;
        }

        // Check color filters
        if (selectedFilters.colors.length > 0) {
            const hasColor = selectedFilters.colors.some(color => 
                text.includes(color)
            );
            if (!hasColor) return false;
        }

        // Check style filters
        if (selectedFilters.styles.length > 0) {
            const hasStyle = selectedFilters.styles.some(style => 
                text.includes(style)
            );
            if (!hasStyle) return false;
        }

        return true;
    });

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Filters */}
            <div className="p-4 bg-white border-b border-gray-200">

                {/* Price Range */}
                <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={1000}
                        step={1}
                    />
                </div>

                {/* Dynamic Material Filters */}
                {dynamicFilters.materials.length > 0 && (
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Material</label>
                        <div className="flex flex-wrap gap-2">
                            {dynamicFilters.materials.map((material) => (
                                <button
                                    key={material}
                                    onClick={() => toggleFilter('materials', material)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                                        selectedFilters.materials.includes(material)
                                            ? 'bg-[#008060] text-white border-[#008060] hover:bg-[#006e52]'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {material}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dynamic Color Filters */}
                {dynamicFilters.colors.length > 0 && (
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Colour</label>
                        <div className="flex flex-wrap gap-2">
                            {dynamicFilters.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => toggleFilter('colors', color)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                                        selectedFilters.colors.includes(color)
                                            ? 'bg-[#008060] text-white border-[#008060] hover:bg-[#006e52]'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dynamic Style Filters */}
                {dynamicFilters.styles.length > 0 && (
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Style</label>
                        <div className="flex flex-wrap gap-2">
                            {dynamicFilters.styles.map((style) => (
                                <button
                                    key={style}
                                    onClick={() => toggleFilter('styles', style)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                                        selectedFilters.styles.includes(style)
                                            ? 'bg-[#008060] text-white border-[#008060] hover:bg-[#006e52]'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clear Filters Button */}
                {(selectedFilters.materials.length > 0 || selectedFilters.colors.length > 0 || selectedFilters.styles.length > 0) && (
                    <button
                        onClick={() => setSelectedFilters({ materials: [], colors: [], styles: [] })}
                        className="text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#008060] mb-4"></div>
                            <p className="text-gray-600">Analyzing your sketch...</p>
                        </div>
                    </div>
                ) : !showResults ? (
                    <div className="bg-[#cbd6c6] h-full flex flex-col items-center justify-center text-center px-6 rounded-xl">
                        <div className="w-50 h-50 mb-6 opacity-80 rounded-xl overflow-hidden border-white border-4">
                            <img
                                src="/mascot.jpg"
                                alt="Draw to search"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <h2 className="text-lg font-bold text-gray-800 mb-2">
                            No results yet
                        </h2>

                        <p className="text-sm text-gray-600 max-w-sm">
                            Draw an object in the canvas on the left and click <span className="font-medium">Search Products</span> to find matching products.
                        </p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center">
                        <p>No products found</p>
                    </div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                    <Card 
                        key={product.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                            if (product.url) {
                                window.open(product.url, '_blank', 'noopener,noreferrer');
                            }
                        }}
                    >
                        {product.image && (
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-48 object-cover bg-gray-100"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                }}
                            />
                        )}
                        <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{product.source || 'Unknown Store'}</p>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-gray-900">
                                ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price || 'N/A'}
                            </span>
                            {product.rating && (
                            <span className="text-sm text-yellow-500">
                                {product.rating} ★ {product.reviews ? `(${product.reviews})` : ''}
                            </span>
                            )}
                        </div>
                        <Button
                            asChild
                            className="w-full bg-[#008060] hover:bg-[#006e52] text-white"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click when clicking button
                            }}
                        >
                            <a href={product.url || '#'} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View in Store
                            </a>
                        </Button>
                        </div>
                    </Card>
                    ))}
                </div>
                )}
            </div>
        </div>
    );
}