import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Slider } from '@/app/components/ui/slider';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';

const mockProducts = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1760716478125-aa948e99ef85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaGFpciUyMGZ1cm5pdHVyZXxlbnwxfHx8fDE3Njg1ODM3NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        title: 'Modern Accent Chair',
        price: 299,
        match: 92,
        store: 'Contemporary Furniture Co.',
        material: 'fabric',
        style: 'modern',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1592496753547-4f0ca90effde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYXJtY2hhaXJ8ZW58MXx8fHwxNzY4NTU4NTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        title: 'Vintage Leather Armchair',
        price: 549,
        match: 87,
        store: 'Classic Seating',
        material: 'leather',
        style: 'vintage',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1604504219246-6a4b59012b8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjBkZXNrJTIwdGFibGV8ZW58MXx8fHwxNzY4NTYxMjIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        title: 'Wooden Desk with Storage',
        price: 399,
        match: 85,
        store: 'Office Essentials',
        material: 'wood',
        style: 'minimalist',
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1763565909003-46e9dfb68a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc29mYXxlbnwxfHx8fDE3Njg2MjYxNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        title: 'Minimalist Sofa',
        price: 799,
        match: 83,
        store: 'Modern Living',
        material: 'fabric',
        style: 'minimalist',
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1667312939978-64cf31718a6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsYW1wfGVufDF8fHx8MTc2ODYzOTQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        title: 'Designer Floor Lamp',
        price: 189,
        match: 79,
        store: 'Lighting Studio',
        material: 'metal',
        style: 'modern',
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1763926025680-7966e45e48f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRhbCUyMHNoZWxmJTIwc3RvcmFnZXxlbnwxfHx8fDE3Njg2Mzk0OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        title: 'Industrial Metal Shelf',
        price: 249,
        match: 76,
        store: 'Storage Solutions',
        material: 'metal',
        style: 'modern',
    },
];

export function ProductResults({ showResults }) {
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectedStyles, setSelectedStyles] = useState([]);

    const materials = ['wood', 'metal', 'fabric', 'leather'];
    const styles = ['modern', 'vintage', 'minimalist'];

    const toggleFilter = (value, list, setter) => {
        if (list.includes(value)) {
            setter(list.filter((item) => item !== value));
        } else {
            setter([...list, value]);
        }
    };

    const filteredProducts = mockProducts.filter((product) => {
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesMaterial = selectedMaterials.length === 0 || selectedMaterials.includes(product.material);
        const matchesStyle = selectedStyles.length === 0 || selectedStyles.includes(product.style);
        return matchesPrice && matchesMaterial && matchesStyle;
    });

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Filters */}
            <div className="p-4 bg-white border-b border-gray-200">
                <h3 className="text-base font-semibold mb-3 text-gray-900">Filters</h3>

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
                        step={50}
                        className="mb-2"
                    />
                </div>

                {/* Material Filter */}
                <div className="mb-4">
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
                </div>

                {/* Style Filter */}
                <div>
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
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-6">
                {!showResults ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <p className="text-lg font-medium mb-2">Draw something and click Search</p>
                            <p className="text-sm">AI will find matching products for you</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="relative">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{product.store}</p>

                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {product.material}
                                                </Badge>
                                                <Badge variant="outline" className="capitalize text-xs">
                                                    {product.style}
                                                </Badge>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full bg-[#008060] hover:bg-[#006e52] text-white"
                                            size="sm"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View in Store
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}