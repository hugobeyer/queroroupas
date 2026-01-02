import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Trash2, Plus } from 'lucide-react';
import { settingsService, uploadService } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Textarea } from '../components/ui/textarea';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  
  const fileInputRefs = {
    logoHeader: useRef(null),
    logoBanner: useRef(null),
    logoFooter: useRef(null),
    heroBanner: useRef(null),
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.get();
      setSettings(data);
    } catch (error) {
      toast.error('Erro ao carregar configurações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    try {
      setUploading({ ...uploading, [field]: true });
      const imageUrl = await uploadService.uploadImage(file);
      setSettings({ ...settings, [field]: imageUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      console.error(error);
    } finally {
      setUploading({ ...uploading, [field]: false });
    }
  };

  const handleBannerImageUpload = async (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido');
      return;
    }

    try {
      setUploading({ ...uploading, heroBanner: true });
      const imageUrl = await uploadService.uploadImage(file);
      const newImages = [...(settings.hero_images || []), imageUrl];
      setSettings({ ...settings, hero_images: newImages });
      toast.success('Imagem adicionada ao banner!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      console.error(error);
    } finally {
      setUploading({ ...uploading, heroBanner: false });
    }
  };

  const removeBannerImage = (index) => {
    const newImages = settings.hero_images.filter((_, i) => i !== index);
    setSettings({ ...settings, hero_images: newImages });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.update(settings);
      toast.success('Configurações salvas! Recarregando página...');
      
      // Wait a bit for the toast to show, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-golden">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-golden mb-2">Configurações</h1>
            <p className="text-gray-400">Personalize o site</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-golden hover:bg-golden-light text-black font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="bg-gray-900 border-golden/20">
            <TabsTrigger value="contact" className="data-[state=active]:bg-golden data-[state=active]:text-black">
              Contato
            </TabsTrigger>
            <TabsTrigger value="hero" className="data-[state=active]:bg-golden data-[state=active]:text-black">
              Banner Principal
            </TabsTrigger>
            <TabsTrigger value="logos" className="data-[state=active]:bg-golden data-[state=active]:text-black">
              Logos
            </TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:bg-golden data-[state=active]:text-black">
              Cores
            </TabsTrigger>
            <TabsTrigger value="sections" className="data-[state=active]:bg-golden data-[state=active]:text-black">
              Seções
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-golden data-[state=active]:text-black">
              Categorias
            </TabsTrigger>
          </TabsList>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card className="bg-gray-900 border-golden/20">
              <CardHeader>
                <CardTitle className="text-golden">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="city" className="text-white">Cidade</Label>
                  <Input
                    id="city"
                    value={settings.city}
                    onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Tab */}
          <TabsContent value="hero">
            <Card className="bg-gray-900 border-golden/20">
              <CardHeader>
                <CardTitle className="text-golden">Banner Principal (Hero)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero_title" className="text-white">Badge/Tag</Label>
                  <Input
                    id="hero_title"
                    value={settings.hero_title}
                    onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                    placeholder="Ex: Nova Coleção"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_subtitle" className="text-white">Título Principal</Label>
                  <Input
                    id="hero_subtitle"
                    value={settings.hero_subtitle}
                    onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                    placeholder="Ex: Quer se vestir pro verão 2025?"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_description" className="text-white">Descrição</Label>
                  <Textarea
                    id="hero_description"
                    value={settings.hero_description}
                    onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label className="text-white mb-2 block">Imagens do Banner (Carrossel)</Label>
                  <p className="text-gray-400 text-sm mb-3">Adicione até 3 imagens que alternarão automaticamente</p>
                  
                  {settings.hero_images && settings.hero_images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {settings.hero_images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Banner ${index + 1}`}
                            className="w-full h-32 object-cover rounded border border-golden/20"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBannerImage(index)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    ref={fileInputRefs.heroBanner}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBannerImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRefs.heroBanner.current?.click()}
                    disabled={uploading.heroBanner || (settings.hero_images && settings.hero_images.length >= 3)}
                    className="border-golden/40 text-golden hover:bg-golden/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {uploading.heroBanner ? 'Enviando...' : 'Adicionar Imagem'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logos Tab */}
          <TabsContent value="logos">
            <Card className="bg-gray-900 border-golden/20">
              <CardHeader>
                <CardTitle className="text-golden">Logos do Site</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Header Logo */}
                <div>
                  <Label className="text-white mb-2 block">Logo do Header (topo)</Label>
                  {settings.logo_header && (
                    <div className="mb-2 p-4 bg-black rounded border border-golden/20">
                      <img src={settings.logo_header} alt="Header Logo" className="h-8 brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                    </div>
                  )}
                  <input
                    ref={fileInputRefs.logoHeader}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo_header', e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRefs.logoHeader.current?.click()}
                    disabled={uploading.logoHeader}
                    className="border-golden/40 text-golden hover:bg-golden/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading.logoHeader ? 'Enviando...' : 'Upload'}
                  </Button>
                </div>

                {/* Banner Logo */}
                <div>
                  <Label className="text-white mb-2 block">Logo do Banner Principal</Label>
                  {settings.logo_banner && (
                    <div className="mb-2 p-4 bg-black rounded border border-golden/20">
                      <img src={settings.logo_banner} alt="Banner Logo" className="w-64 brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                    </div>
                  )}
                  <input
                    ref={fileInputRefs.logoBanner}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo_banner', e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRefs.logoBanner.current?.click()}
                    disabled={uploading.logoBanner}
                    className="border-golden/40 text-golden hover:bg-golden/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading.logoBanner ? 'Enviando...' : 'Upload'}
                  </Button>
                </div>

                {/* Footer Logo */}
                <div>
                  <Label className="text-white mb-2 block">Logo do Footer (rodapé)</Label>
                  {settings.logo_footer && (
                    <div className="mb-2 p-4 bg-black rounded border border-golden/20">
                      <img src={settings.logo_footer} alt="Footer Logo" className="h-8 brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                    </div>
                  )}
                  <input
                    ref={fileInputRefs.logoFooter}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo_footer', e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRefs.logoFooter.current?.click()}
                    disabled={uploading.logoFooter}
                    className="border-golden/40 text-golden hover:bg-golden/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading.logoFooter ? 'Enviando...' : 'Upload'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card className="bg-gray-900 border-golden/20">
              <CardHeader>
                <CardTitle className="text-golden">Paleta de Cores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="color_primary" className="text-white mb-2 block">Cor Primária (Botões, Links)</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="color_primary"
                      type="color"
                      value={settings.color_primary}
                      onChange={(e) => setSettings({ ...settings, color_primary: e.target.value })}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      value={settings.color_primary}
                      onChange={(e) => setSettings({ ...settings, color_primary: e.target.value })}
                      className="bg-black border-golden/20 text-white"
                      placeholder="#ff8637"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="color_secondary" className="text-white mb-2 block">Cor Secundária (Detalhes, Fundos)</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="color_secondary"
                      type="color"
                      value={settings.color_secondary}
                      onChange={(e) => setSettings({ ...settings, color_secondary: e.target.value })}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      value={settings.color_secondary}
                      onChange={(e) => setSettings({ ...settings, color_secondary: e.target.value })}
                      className="bg-black border-golden/20 text-white"
                      placeholder="#2e081c"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="color_background" className="text-white mb-2 block">Cor de Fundo</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="color_background"
                      type="color"
                      value={settings.color_background}
                      onChange={(e) => setSettings({ ...settings, color_background: e.target.value })}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      value={settings.color_background}
                      onChange={(e) => setSettings({ ...settings, color_background: e.target.value })}
                      className="bg-black border-golden/20 text-white"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections">
            <Card className="bg-gray-900 border-golden/20">
              <CardHeader>
                <CardTitle className="text-golden">Textos das Seções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="featured_title" className="text-white">Título da Seção Destaques</Label>
                  <Input
                    id="featured_title"
                    value={settings.featured_title}
                    onChange={(e) => setSettings({ ...settings, featured_title: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="featured_description" className="text-white">Descrição da Seção Destaques</Label>
                  <Textarea
                    id="featured_description"
                    value={settings.featured_description}
                    onChange={(e) => setSettings({ ...settings, featured_description: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="cta_title" className="text-white">Título da Seção Newsletter</Label>
                  <Input
                    id="cta_title"
                    value={settings.cta_title}
                    onChange={(e) => setSettings({ ...settings, cta_title: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cta_description" className="text-white">Descrição da Seção Newsletter</Label>
                  <Textarea
                    id="cta_description"
                    value={settings.cta_description}
                    onChange={(e) => setSettings({ ...settings, cta_description: e.target.value })}
                    className="bg-black border-golden/20 text-white"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="bg-gray-900 border-golden/20">
              <CardHeader>
                <CardTitle className="text-golden">Categorias de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">
                  Gerenciar as categorias de produtos do catálogo. Uma por linha.
                </p>
                <Textarea
                  value={settings.categories?.join('\n') || ''}
                  onChange={(e) => {
                    const cats = e.target.value.split('\n').filter(c => c.trim());
                    setSettings({ ...settings, categories: cats });
                  }}
                  className="bg-black border-golden/20 text-white font-mono"
                  rows={12}
                  placeholder="Vestidos&#10;Blusas&#10;Calças&#10;..."
                />
                <p className="text-gray-500 text-xs mt-2">
                  Total: {settings.categories?.length || 0} categorias
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
