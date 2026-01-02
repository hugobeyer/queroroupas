import React, { useState, useEffect, useMemo } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { productService } from '../services/api';
import { useSettingsContext } from '../context/SettingsContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [favorites, setFavorites] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettingsContext();

  const categories = ['Todos', ...(settings?.categories || [
    'Vestidos',
    'Blusas',
    'Calças',
    'Saias',
    'Conjuntos',
    'Blazers',
    'Tops',
    'Shorts',
    'Jaquetas',
  ])];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await productService.getAll();
      setAllProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return allProducts;
    }
    return allProducts.filter((product) => product.category === selectedCategory);
  }, [selectedCategory, allProducts]);

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
    toast.success(
      favorites.includes(productId)
        ? 'Removido dos favoritos'
        : 'Adicionado aos favoritos'
    );
  };

  const addToCart = (productName) => {
    toast.success(`${productName} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-black border-b border-golden/20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif text-golden text-center mb-4">
            Catálogo
          </h1>
          <p className="text-gray-400 text-center max-w-2xl mx-auto">
            Explore nossa coleção completa de moda feminina
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-40 bg-black/95 backdrop-blur-sm border-b border-golden/20 py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={`whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-golden text-black hover:bg-golden-light'
                    : 'border-golden/40 text-golden hover:bg-golden/10'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <p className="text-gray-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Carregando...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum produto encontrado nesta categoria</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group bg-black border-golden/20 hover:border-golden/60 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.isNew && (
                      <Badge className="absolute top-2 left-2 bg-golden text-black border-0">
                        Novo
                      </Badge>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(product.id)
                            ? 'fill-golden text-golden'
                            : 'text-white'
                        }`}
                      />
                    </button>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <Button
                        onClick={() => addToCart(product.name)}
                        className="w-full bg-golden hover:bg-golden-light text-black font-medium"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <p className="text-gray-400 text-xs tracking-wider uppercase mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-white font-medium mb-2 text-sm md:text-base">
                      {product.name}
                    </h3>
                    <p className="text-golden font-bold">R$ {product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Catalog;