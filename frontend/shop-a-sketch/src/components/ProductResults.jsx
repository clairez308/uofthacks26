import { useState } from 'react';
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
  

export function ProductResults({ showResults, products }) {
    const [priceRange, setPriceRange] = useState([0, 1000]);
    // const [selectedMaterials, setSelectedMaterials] = useState([]);
    // const [selectedStyles, setSelectedStyles] = useState([]);

    // const materials = ['wood', 'metal', 'fabric', 'leather'];
    // const styles = ['modern', 'vintage', 'minimalist'];

    const filteredProducts = products.filter((product) => {
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesPrice;
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

                {/* Material Filter */}
                {/* <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Material</label>
                    <div className="flex flex-wrap gap-2">
                        {materials.map((material) => (
                            <Badge
                                key={material}
                                variant={selectedMaterials.includes(material) ? 'default' : 'outline'}
                                className={`cursor-pointer capitalize ${selectedMaterials.includes(material)
                                        ? 'bg-[#008060] hover:bg-[#006e52]'
                                        : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => toggleFilter(material, selectedMaterials, setSelectedMaterials)}
                            >
                                {material}
                            </Badge>
                        ))}
                    </div>
                </div> */}

                {/* Style Filter */}
                {/* <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Style</label>
                    <div className="flex flex-wrap gap-2">
                        {styles.map((style) => (
                            <Badge
                                key={style}
                                variant={selectedStyles.includes(style) ? 'default' : 'outline'}
                                className={`cursor-pointer capitalize ${selectedStyles.includes(style)
                                        ? 'bg-[#008060] hover:bg-[#006e52]'
                                        : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => toggleFilter(style, selectedStyles, setSelectedStyles)}
                            >
                                {style}
                            </Badge>
                        ))}
                    </div>
                </div> */}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-6">
            {!showResults ? (
  <div className="bg-[#cbd6c6] h-full flex flex-col items-center justify-center text-center px-6 rounded-xl">
    <div className="w-50 h-50 mb-6 opacity-80 rounded-xl overflow-hidden border-white border-4">
      <img
        src="/mascot.jpg" // optional image in public/
        alt="Draw to search"
        className="w-full h-full object-contain"
      />
    </div>

    <h2 className="text-lg font-bold text-gray-800 mb-2">
      No results yet
    </h2>

    <p className="text-sm text-gray max-w-sm">
      Draw an object in the canvas on the left and click <span className="font-medium">Search Products</span> to find matching products.
    </p>
  </div>
) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{product.store}</p>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                            {product.rating && (
                            <span className="text-sm text-yellow-500">{product.rating} ★ ({product.reviews})</span>
                            )}
                        </div>
                        <Button
                            asChild
                            className="w-full bg-[#008060] hover:bg-[#006e52] text-white"
                            size="sm"
                        >
                            <a href={product.url} target="_blank" rel="noopener noreferrer">
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