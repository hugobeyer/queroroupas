import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, Award } from 'lucide-react';
import { productService, newsletterService } from '../services/api';
import { useSettingsContext } from '../context/SettingsContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { settings } = useSettingsContext();

  useEffect(() => {
    loadProducts();
  }, []);

  // Image carousel effect
  useEffect(() => {
    if (settings && settings.hero_images && settings.hero_images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % settings.hero_images.length
        );
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [settings]);

  const loadProducts = async () => {
    try {
      const products = await productService.getAll();
      // Get only new products or first 4
      const featured = products.filter(p => p.isNew).slice(0, 4);
      if (featured.length < 4) {
        const remaining = products.filter(p => !p.isNew).slice(0, 4 - featured.length);
        setFeaturedProducts([...featured, ...remaining]);
      } else {
        setFeaturedProducts(featured);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-golden">Carregando...</p>
      </div>
    );
  }

  const currentHeroImage = settings.hero_images && settings.hero_images.length > 0 
    ? settings.hero_images[currentImageIndex] 
    : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80";

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[70vh] mb-32">
        {/* Background Images with Fade */}
        <div className="absolute inset-0 overflow-hidden">
          {settings.hero_images && settings.hero_images.map((img, index) => (
            <div
              key={index}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${img})`,
                opacity: index === currentImageIndex ? 1 : 0,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>
          ))}
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl -mt-12">
            {settings.logo_banner && (
              <img 
                src={settings.logo_banner}
                alt="Quero Roupas Logo"
                className="w-80 md:w-96 mb-10 brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            )}
            <Badge className="mb-4 bg-golden/20 text-golden border-golden hover:bg-golden/30">
              <Sparkles className="w-3 h-3 mr-1" />
              {settings.hero_title}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 leading-tight">
              {settings.hero_subtitle}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {settings.hero_description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalog">
                <Button className="bg-golden hover:bg-golden-light text-black font-medium px-8 py-6 text-base">
                  Ver Coleção
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-golden text-golden hover:bg-golden/10 px-8 py-6 text-base"
              >
                Novidades
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Cards - Overlapping Banner */}
        <div className="absolute -bottom-20 left-0 right-0 z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-burgundy/60 backdrop-blur-md border-golden/30 hover:border-golden/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-golden/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-golden" />
                  </div>
                  <h3 className="text-golden font-medium mb-2 tracking-wider uppercase text-sm">Tendências</h3>
                  <p className="text-gray-300 text-sm">Sempre à frente com as últimas tendências da moda</p>
                </CardContent>
              </Card>

              <Card className="bg-burgundy/60 backdrop-blur-md border-golden/30 hover:border-golden/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-golden/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-golden" />
                  </div>
                  <h3 className="text-golden font-medium mb-2 tracking-wider uppercase text-sm">Qualidade Premium</h3>
                  <p className="text-gray-300 text-sm">Peças selecionadas com materiais nobres</p>
                </CardContent>
              </Card>

              <Card className="bg-burgundy/60 backdrop-blur-md border-golden/30 hover:border-golden/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-golden/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-golden" />
                  </div>
                  <h3 className="text-golden font-medium mb-2 tracking-wider uppercase text-sm">Exclusividade</h3>
                  <p className="text-gray-300 text-sm">Coleções limitadas e exclusivas</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-black via-burgundy/20 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-golden mb-4">{settings.featured_title}</h2>
            <p className="text-gray-400 text-lg">{settings.featured_description}</p>
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Carregando...</p>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum produto disponível</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group bg-black border-golden/20 hover:border-golden/60 transition-all duration-300 overflow-hidden cursor-pointer"
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
                  </div>
                  <CardContent className="p-4">
                    <p className="text-gray-400 text-xs tracking-wider uppercase mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-white font-medium mb-2">{product.name}</h3>
                    <p className="text-golden font-bold">R$ {product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/catalog">
              <Button className="bg-golden hover:bg-golden-light text-black font-medium px-8 py-6">
                Ver Todos os Produtos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-black via-burgundy/30 to-black border-t border-golden/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-golden mb-4">
            {settings.cta_title}
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            {settings.cta_description}
          </p>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const email = e.target.email.value;
              try {
                await newsletterService.subscribe(email);
                toast.success('Inscrito com sucesso!');
                e.target.reset();
              } catch (error) {
                toast.error('Erro ao se inscrever');
              }
            }}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              name="email"
              placeholder="Seu e-mail"
              required
              className="flex-1 px-4 py-3 bg-burgundy/20 border border-golden/20 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-golden transition-colors"
            />
            <Button type="submit" className="bg-golden hover:bg-golden-light text-black font-medium px-8 py-3">
              Inscrever
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;