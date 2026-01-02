import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Trash2, Edit, Eye, Users, Mail } from 'lucide-react';
import { newsletterService, uploadService } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

const Newsletter = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    image_url: '',
  });

  const imageInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsData, subscribersData] = await Promise.all([
        newsletterService.getCampaigns(),
        newsletterService.getSubscribers(),
      ]);
      setCampaigns(campaignsData);
      setSubscribers(subscribersData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPG, PNG, WEBP ou GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading file:', file.name, file.type, file.size);
      const imageUrl = await uploadService.uploadImage(file);
      console.log('Upload successful, URL:', imageUrl);
      setFormData({ ...formData, image_url: imageUrl });
      toast.success('Imagem enviada com sucesso!');
      // Clear the input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.subject || !formData.content) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingCampaign) {
        await newsletterService.updateCampaign(editingCampaign.id, formData);
        toast.success('Campanha atualizada!');
      } else {
        await newsletterService.createCampaign(formData);
        toast.success('Campanha criada!');
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar campanha');
      console.error(error);
    }
  };

  const handleEdit = (campaign) => {
    setFormData({
      title: campaign.title,
      subject: campaign.subject,
      content: campaign.content,
      image_url: campaign.image_url || '',
    });
    setEditingCampaign(campaign);
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
      try {
        await newsletterService.deleteCampaign(id);
        toast.success('Campanha excluída!');
        loadData();
      } catch (error) {
        toast.error('Erro ao excluir campanha');
      }
    }
  };

  const handlePreview = async (campaign) => {
    try {
      const { html } = await newsletterService.previewCampaign(campaign.id);
      setPreviewHtml(html);
      setShowPreviewModal(true);
    } catch (error) {
      toast.error('Erro ao gerar preview');
    }
  };

  const handleSend = async (campaign) => {
    if (window.confirm(`Enviar esta campanha para ${subscribers.length} assinantes?`)) {
      try {
        const result = await newsletterService.sendCampaign(campaign.id);
        toast.success(result.message);
        loadData();
      } catch (error) {
        toast.error('Erro ao enviar campanha');
        console.error(error);
      }
    }
  };

  const handleUnsubscribe = async (id) => {
    if (window.confirm('Remover este assinante?')) {
      try {
        await newsletterService.unsubscribe(id);
        toast.success('Assinante removido!');
        loadData();
      } catch (error) {
        toast.error('Erro ao remover assinante');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      content: '',
      image_url: '',
    });
    setEditingCampaign(null);
    setShowCreateModal(false);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-golden mb-2">Newsletter</h1>
          <p className="text-gray-400">Gerencie campanhas de email e assinantes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-golden/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Assinantes</p>
                <p className="text-3xl font-bold text-golden">{subscribers.length}</p>
              </div>
              <Users className="w-12 h-12 text-golden/30" />
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-golden/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Campanhas Criadas</p>
                <p className="text-3xl font-bold text-golden">{campaigns.length}</p>
              </div>
              <Mail className="w-12 h-12 text-golden/30" />
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-golden/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Campanhas Enviadas</p>
                <p className="text-3xl font-bold text-golden">
                  {campaigns.filter(c => c.sent).length}
                </p>
              </div>
              <Send className="w-12 h-12 text-golden/30" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="bg-gray-900 border-golden/20">
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-golden data-[state=active]:text-black">
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="data-[state=active]:bg-golden data-[state=active]:text-black">
              Assinantes
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="mb-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-golden hover:bg-golden-light text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Campanha
              </Button>
            </div>

            <Card className="bg-gray-900 border-golden/20">
              <CardHeader>
                <CardTitle className="text-golden">Campanhas de Email</CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhuma campanha criada</p>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-4 bg-black rounded-lg border border-golden/20 hover:border-golden/40 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-medium text-lg">{campaign.title}</h3>
                              {campaign.sent && (
                                <Badge className="bg-golden text-black">
                                  Enviada ({campaign.sent_count})
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-1">
                              <strong>Assunto:</strong> {campaign.subject}
                            </p>
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {campaign.content}
                            </p>
                            {campaign.sentAt && (
                              <p className="text-gray-500 text-xs mt-2">
                                Enviada em: {new Date(campaign.sentAt).toLocaleString('pt-BR')}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(campaign)}
                              className="text-white hover:text-golden"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!campaign.sent && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(campaign)}
                                  className="text-white hover:text-golden"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSend(campaign)}
                                  className="text-white hover:text-golden"
                                  title="Enviar"
                                  disabled={subscribers.length === 0}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(campaign.id)}
                              className="text-white hover:text-red-500"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="bg-gray-900 border-golden/20">
              <CardHeader>
                <CardTitle className="text-golden">Lista de Assinantes</CardTitle>
              </CardHeader>
              <CardContent>
                {subscribers.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nenhum assinante ainda</p>
                ) : (
                  <div className="space-y-2">
                    {subscribers.map((subscriber) => (
                      <div
                        key={subscriber.id}
                        className="flex items-center justify-between p-3 bg-black rounded border border-golden/20"
                      >
                        <div>
                          <p className="text-white">{subscriber.email}</p>
                          <p className="text-gray-500 text-xs">
                            Inscrito em: {new Date(subscriber.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnsubscribe(subscriber.id)}
                          className="text-white hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Modal */}
        <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="bg-gray-900 border-golden/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-golden">
                {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title" className="text-white">Título da Campanha *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-black border-golden/20 text-white"
                  placeholder="Ex: Nova Coleção Verão 2025"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-white">Assunto do Email *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-black border-golden/20 text-white"
                  placeholder="Ex: Confira nossa nova coleção!"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-white">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-black border-golden/20 text-white"
                  rows={6}
                  placeholder="Escreva o conteúdo do email..."
                  required
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Imagem (opcional)</Label>
                {formData.image_url && (
                  <div className="mb-3 relative">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded border border-golden/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading}
                    className="border-golden/40 text-golden hover:bg-golden/10"
                  >
                    {uploading ? 'Enviando...' : formData.image_url ? 'Trocar Imagem' : 'Upload Imagem'}
                  </Button>
                  {formData.image_url && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="border-red-500/40 text-red-500 hover:bg-red-500/10"
                    >
                      Remover Imagem
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-golden hover:bg-golden-light text-black">
                  {editingCampaign ? 'Atualizar' : 'Criar Campanha'}
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
          </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="bg-white text-black max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Preview do Email</DialogTitle>
            </DialogHeader>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Newsletter;
