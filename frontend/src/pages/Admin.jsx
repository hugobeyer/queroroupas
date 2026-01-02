import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, Plus, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { productService, uploadService } from '../services/api';
import { useSettingsContext } from '../context/SettingsContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { settings } = useSettingsContext();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    isNew: false,
  });
  const fileInputRef = useRef(null);

  const categories = settings?.categories || [
    'Vestidos',
    'Blusas',
    'Calças',
    'Saias',
    'Conjuntos',
    'Blazers',
    'Tops',
    'Shorts',
    'Jaquetas',
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    console.log('[Admin] File selected:', file);
    
    if (!file) {
      console.log('[Admin] No file selected');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      console.error('[Admin] Invalid file type:', file.type);
      toast.error('Tipo de arquivo inválido. Use JPG, PNG, WEBP ou GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('[Admin] File too large:', file.size);
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    try {
      console.log('[Admin] Starting upload...');
      setUploading(true);
      
      const imageUrl = await uploadService.uploadImage(file);
      
      console.log('[Admin] Upload successful, URL:', imageUrl);
      setFormData({ ...formData, image: imageUrl });
      toast.success('Imagem enviada com sucesso!');
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[Admin] Upload error:', error);
      toast.error(error.response?.data?.detail || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
      console.log('[Admin] Upload process complete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingId) {
        await productService.update(editingId, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productService.create({
          ...formData,
          price: parseFloat(formData.price),
        });
        toast.success('Produto adicionado com sucesso!');
      }
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error('Erro ao salvar produto');
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      isNew: product.isNew,
    });
    setEditingId(product.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productService.delete(id);
        toast.success('Produto excluído com sucesso!');
        loadProducts();
      } catch (error) {
        toast.error('Erro ao excluir produto');
        console.error(error);
      }
    }
  };

  const toggleNew = async (product) => {
    try {
      await productService.update(product.id, { isNew: !product.isNew });
      toast.success('Status atualizado!');
      loadProducts();
    } catch (error) {
      toast.error('Erro ao atualizar status');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      category: '',
      isNew: false,
    });
    setEditingId(null);
    setShowAddForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-golden mb-2">Administração</h1>
          <p className="text-gray-400">Gerencie o catálogo de produtos</p>
        </div>

        {/* Add/Edit Form */}
        {showAddForm ? (
          <Card className="bg-gray-900 border-golden/20 mb-8">
            <CardHeader>
              <CardTitle className="text-golden flex items-center justify-between">
                <span>{editingId ? 'Editar Produto' : 'Adicionar Novo Produto'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-white hover:text-golden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-black border-golden/20 text-white"
                      placeholder="Ex: Vestido Elegante"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-white">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-black border-golden/20 text-white"
                      placeholder="299.90"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-black border-golden/20 text-white">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-golden/20">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-white">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isNew"
                      checked={formData.isNew}
                      onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                    />
                    <Label htmlFor="isNew" className="text-white cursor-pointer">
                      Marcar como Novidade
                    </Label>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label className="text-white">Imagem do Produto</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="border-golden/40 text-golden hover:bg-golden/10"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Enviando...' : 'Fazer Upload'}
                      </Button>
                      {formData.image && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remover Imagem
                        </Button>
                      )}
                    </div>
                    
                    {formData.image && (
                      <div className="relative w-full max-w-xs">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded border border-golden/20"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-golden hover:bg-golden-light text-black">
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-golden/40 text-golden hover:bg-golden/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-golden hover:bg-golden-light text-black mb-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        )}

        {/* Products List */}
        <Card className="bg-gray-900 border-golden/20">
          <CardHeader>
            <CardTitle className="text-golden">Produtos ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400 text-center py-8">Carregando...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum produto cadastrado</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 bg-black rounded-lg border border-golden/20 hover:border-golden/40 transition-colors"
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-800 rounded flex items-center justify-center">
                        <ImageIcon className="text-gray-600 w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-white font-medium">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-golden/40 text-golden">
                          {product.category}
                        </Badge>
                        {product.isNew && (
                          <Badge className="bg-golden text-black">Novo</Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-golden font-bold">R$ {product.price.toFixed(2)}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleNew(product)}
                        className="text-white hover:text-golden"
                        title={product.isNew ? 'Remover de novidades' : 'Marcar como novo'}
                      >
                        {product.isNew ? '★' : '☆'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="text-white hover:text-golden"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-white hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;