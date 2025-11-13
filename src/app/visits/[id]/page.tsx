'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Edit, Trash2, Camera, Mic, FileText, MapPin, User, Calendar, Clock, AlertCircle, ShoppingBag, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface Visit {
  id: string;
  scheduled_date: string;
  status: string;
  objective?: string;
  discussion_summary?: string;
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  property: {
    id: string;
    name: string;
    city?: string;
    plots: Array<{
      id: string;
      name: string;
      crop?: string;
      area_hectares?: number;
    }>;
  };
  plotEvaluations: Array<{
    id: string;
    phenological_stage?: string;
    pest_or_disease?: string;
    infestation_level?: string;
    weeds?: string;
    technical_recommendation?: string;
    plot: {
      id: string;
      name: string;
      crop?: string;
      area_hectares?: number;
    };
    media: Array<{
      id: string;
      file_path: string;
      media_type: string;
    }>;
    created_at: string;
  }>;
}

interface EvaluationFormData {
  plot_id: string;
  phenological_stage: string;
  pest_or_disease: string;
  infestation_level: string;
  weeds: string;
  technical_recommendation: string;
}

const PHENOLOGICAL_STAGES = [
  'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
  'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9',
  'Emergência', 'Desenvolvimento Vegetativo', 'Floração', 'Frutificação', 'Maturação'
];

export default function VisitExecutionPage() {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSummary, setSavingSummary] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<any>(null);
  const [evaluationFormData, setEvaluationFormData] = useState<EvaluationFormData>({
    plot_id: '',
    phenological_stage: '',
    pest_or_disease: '',
    infestation_level: '',
    weeds: '',
    technical_recommendation: ''
  });
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [orderFormData, setOrderFormData] = useState({
    client_id: '',
    status: 'COTAÇÃO',
    orderItems: [{
      product_id: '',
      quantity: 1,
      unit_price: 0
    }]
  });

  const params = useParams();
  const router = useRouter();
  const visitId = params.id as string;

  useEffect(() => {
    fetchVisit();
    fetchClients();
    fetchProducts();
  }, [visitId]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchVisit = async () => {
    try {
      const response = await fetch(`/api/visits/${visitId}`);
      if (response.ok) {
        const data = await response.json();
        setVisit(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Visita não encontrada',
          variant: 'destructive'
        });
        router.push('/agenda');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar visita',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDiscussionSummary = async (summary: string) => {
    setSavingSummary(true);
    try {
      const response = await fetch(`/api/visits/${visitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussion_summary: summary,
          status: 'REALIZADA'
        }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Pauta salva com sucesso',
        });
        fetchVisit();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao salvar pauta',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar pauta',
        variant: 'destructive'
      });
    } finally {
      setSavingSummary(false);
    }
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingEvaluation ? `/api/evaluations/${editingEvaluation.id}` : '/api/evaluations';
      const method = editingEvaluation ? 'PUT' : 'POST';
      const body = {
        ...evaluationFormData,
        ...(editingEvaluation ? {} : { visit_id: visitId })
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: editingEvaluation ? 'Avaliação atualizada com sucesso' : 'Avaliação criada com sucesso',
        });
        
        setIsEvaluationDialogOpen(false);
        setEditingEvaluation(null);
        setEvaluationFormData({
          plot_id: '',
          phenological_stage: '',
          pest_or_disease: '',
          infestation_level: '',
          weeds: '',
          technical_recommendation: ''
        });
        fetchVisit();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao salvar avaliação',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar avaliação',
        variant: 'destructive'
      });
    }
  };

  const handleEditEvaluation = (evaluation: any) => {
    setEditingEvaluation(evaluation);
    setEvaluationFormData({
      plot_id: evaluation.plot_id,
      phenological_stage: evaluation.phenological_stage || '',
      pest_or_disease: evaluation.pest_or_disease || '',
      infestation_level: evaluation.infestation_level || '',
      weeds: evaluation.weeds || '',
      technical_recommendation: evaluation.technical_recommendation || ''
    });
    setIsEvaluationDialogOpen(true);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate order items
      for (const item of orderFormData.orderItems) {
        if (!item.product_id || !item.quantity || !item.unit_price) {
          toast({
            title: 'Erro',
            description: 'Todos os itens devem ter produto, quantidade e preço unitário',
            variant: 'destructive'
          });
          return;
        }
      }

      const response = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderFormData,
          client_id: visit?.client_id || '',
          visit_id: visitId
        }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Pedido criado com sucesso',
        });
        
        setIsOrderDialogOpen(false);
        setOrderFormData({
          client_id: '',
          status: 'COTAÇÃO',
          orderItems: [{
            product_id: '',
            quantity: 1,
            unit_price: 0
          }]
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao criar pedido',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao criar pedido',
        variant: 'destructive'
      });
    }
  };

  const handleAddOrderItem = () => {
    setOrderFormData({
      ...orderFormData,
      orderItems: [
        ...orderFormData.orderItems,
        { product_id: '', quantity: 1, unit_price: 0 }
      ]
    });
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderFormData({
      ...orderFormData,
      orderItems: orderFormData.orderItems.filter((_, i) => i !== index)
    });
  };

  const handleOrderItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...orderFormData.orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderFormData({ ...orderFormData, orderItems: updatedItems });
  };

  const calculateOrderTotal = () => {
    return orderFormData.orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADA': return 'default';
      case 'REALIZADA': return 'default';
      case 'CANCELADA': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando visita...</div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Visita não encontrada</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/agenda')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Agenda
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Execução da Visita</h1>
              <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  {visit.client.name}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {visit.property.name}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(visit.scheduled_date).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {new Date(visit.scheduled_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <Badge variant={getStatusColor(visit.status)} className="text-sm">
              {visit.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Visita */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-semibold">{visit.client.name}</div>
                {visit.client.phone && (
                  <div className="text-sm text-muted-foreground">{visit.client.phone}</div>
                )}
                {visit.client.email && (
                  <div className="text-sm text-muted-foreground">{visit.client.email}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Propriedade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-semibold">{visit.property.name}</div>
                {visit.property.city && (
                  <div className="text-sm text-muted-foreground">{visit.property.city}</div>
                )}
                <div className="text-sm text-muted-foreground">
                  {visit.property.plots.length} talhõ{visit.property.plots.length !== 1 ? 'es' : 'es'}
                </div>
              </div>
            </CardContent>
          </Card>

          {visit.objective && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Objetivo da Visita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{visit.objective}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Pauta com o Produtor</TabsTrigger>
              <TabsTrigger value="evaluations">
                Avaliações de Campo ({visit.plotEvaluations.length})
              </TabsTrigger>
              <TabsTrigger value="orders">Negócios/Pedidos</TabsTrigger>
            </TabsList>

            {/* Pauta com o Produtor */}
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Pauta Estratégica
                    </div>
                    <Button
                      size="sm"
                      onClick={() => saveDiscussionSummary(visit.discussion_summary || '')}
                      disabled={savingSummary}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {savingSummary ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Registre os pontos principais discutidos com o produtor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={visit.discussion_summary || ''}
                    onChange={(e) => setVisit({ ...visit, discussion_summary: e.target.value })}
                    placeholder="Descreva aqui os principais tópicos discutidos com o produtor, preocupações levantadas, decisões tomadas, etc..."
                    rows={12}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Negócios/Pedidos */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Negócios/Pedidos
                      </CardTitle>
                      <CardDescription>
                        Crie pedidos de venda a partir desta visita
                      </CardDescription>
                    </div>
                    <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Pedido
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Novo Pedido de Venda</DialogTitle>
                          <DialogDescription>
                            Crie um novo pedido para o cliente
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateOrder} className="space-y-4">
                          <div>
                            <Label htmlFor="client">Cliente *</Label>
                            <Select
                              value={orderFormData.client_id}
                              onValueChange={(value) => setOrderFormData({ ...orderFormData, client_id: value, visit_id: visitId })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={orderFormData.status}
                              onValueChange={(value) => setOrderFormData({ ...orderFormData, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="COTAÇÃO">COTAÇÃO</SelectItem>
                                <SelectItem value="APROVADO">APROVADO</SelectItem>
                                <SelectItem value="PEDIDO FECHADO">PEDIDO FECHADO</SelectItem>
                                <SelectItem value="FATURADO">FATURADO</SelectItem>
                                <SelectItem value="ENTREGUE">ENTREGUE</SelectItem>
                                <SelectItem value="CANCELADO">CANCELADO</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Itens do Pedido</Label>
                              <Button type="button" variant="outline" onClick={handleAddOrderItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Item
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {orderFormData.orderItems.map((item, index) => (
                              <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Item {index + 1}</span>
                                  {orderFormData.orderItems.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveOrderItem(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                  <div>
                                    <Label className="text-sm font-medium">Produto *</Label>
                                    <Select
                                      value={item.product_id}
                                      onValueChange={(value) => handleOrderItemChange(index, 'product_id', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {products.map((product) => (
                                          <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Quantidade *</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      step="0.01"
                                      value={item.quantity}
                                      onChange={(e) => handleOrderItemChange(index, 'quantity', parseFloat(e.target.value))}
                                      placeholder="0"
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Preço Unitário *</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.unit_price}
                                      onChange={(e) => handleOrderItemChange(index, 'unit_price', parseFloat(e.target.value))}
                                      placeholder="0.00"
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Subtotal</Label>
                                    <div className="font-medium">
                                      R$ {(item.quantity * item.unit_price).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {orderFormData.orderItems.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">Adicione itens ao pedido</p>
                            </div>
                          )}

                          {orderFormData.orderItems.length > 0 && (
                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold">Total do Pedido:</span>
                                <span className="text-lg font-bold text-green-600">
                                  R$ {calculateOrderTotal().toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}

          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={!orderFormData.client_id || orderFormData.orderItems.length === 0}
                            >
                              Criar Pedido
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Clique em "Criar Pedido" para iniciar uma nova venda
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Avaliações de Campo</CardTitle>
                      <CardDescription>
                        Registre as avaliações técnicas dos talhões visitados
                      </CardDescription>
                    </div>
                    <Dialog open={isEvaluationDialogOpen} onOpenChange={setIsEvaluationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Avaliação
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingEvaluation ? 'Editar Avaliação' : 'Nova Avaliação de Talhão'}
                          </DialogTitle>
                          <DialogDescription>
                            {editingEvaluation ? 'Atualize as informações da avaliação' : 'Registre os achados técnicos do talhão'}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="plot">Talhão *</Label>
                            <Select
                              value={evaluationFormData.plot_id}
                              onValueChange={(value) => setEvaluationFormData({ ...evaluationFormData, plot_id: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o talhão avaliado" />
                              </SelectTrigger>
                              <SelectContent>
                                {visit.property.plots.map((plot) => (
                                  <SelectItem key={plot.id} value={plot.id}>
                                    {plot.name} {plot.crop && `- ${plot.crop}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="phenological">Estádio Fenológico</Label>
                            <Select
                              value={evaluationFormData.phenological_stage}
                              onValueChange={(value) => setEvaluationFormData({ ...evaluationFormData, phenological_stage: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o estádio fenológico" />
                              </SelectTrigger>
                              <SelectContent>
                                {PHENOLOGICAL_STAGES.map((stage) => (
                                  <SelectItem key={stage} value={stage}>
                                    {stage}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="pest">Praga ou Doença Identificada</Label>
                            <Input
                              id="pest"
                              value={evaluationFormData.pest_or_disease}
                              onChange={(e) => setEvaluationFormData({ ...evaluationFormData, pest_or_disease: e.target.value })}
                              placeholder="Ex: Lagarta-do-cartucho, Oídio, Ferrugem..."
                            />
                          </div>

                          <div>
                            <Label htmlFor="infestation">Nível de Infestação</Label>
                            <Input
                              id="infestation"
                              value={evaluationFormData.infestation_level}
                              onChange={(e) => setEvaluationFormData({ ...evaluationFormData, infestation_level: e.target.value })}
                              placeholder="Ex: 2 por planta, 10% da área, baixo, médio, alto..."
                            />
                          </div>

                          <div>
                            <Label htmlFor="weeds">Plantas Daninhas</Label>
                            <Input
                              id="weeds"
                              value={evaluationFormData.weeds}
                              onChange={(e) => setEvaluationFormData({ ...evaluationFormData, weeds: e.target.value })}
                              placeholder="Principais plantas daninhas encontradas..."
                            />
                          </div>

                          <div>
                            <Label htmlFor="recommendation">Recomendação Técnica</Label>
                            <Textarea
                              id="recommendation"
                              value={evaluationFormData.technical_recommendation}
                              onChange={(e) => setEvaluationFormData({ ...evaluationFormData, technical_recommendation: e.target.value })}
                              placeholder="Descreva as recomendações técnicas para este talhão..."
                              rows={4}
                            />
                          </div>

                          <DialogFooter>
                            <Button type="submit" disabled={!evaluationFormData.plot_id}>
                              {editingEvaluation ? 'Atualizar' : 'Criar'} Avaliação
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {visit.plotEvaluations.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhuma avaliação registrada</p>
                      <p className="text-sm text-muted-foreground">Adicione a primeira avaliação técnica</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visit.plotEvaluations.map((evaluation) => (
                        <Card key={evaluation.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold">{evaluation.plot.name}</h3>
                                  {evaluation.plot.crop && (
                                    <Badge variant="outline" className="text-xs">
                                      {evaluation.plot.crop}
                                    </Badge>
                                  )}
                                </div>
                                
                                {evaluation.phenological_stage && (
                                  <div>
                                    <span className="text-sm font-medium">Estádio Fenológico:</span>
                                    <span className="text-sm ml-2">{evaluation.phenological_stage}</span>
                                  </div>
                                )}

                                {evaluation.pest_or_disease && (
                                  <div>
                                    <span className="text-sm font-medium">Praga/Doença:</span>
                                    <span className="text-sm ml-2">{evaluation.pest_or_disease}</span>
                                  </div>
                                )}

                                {evaluation.infestation_level && (
                                  <div>
                                    <span className="text-sm font-medium">Nível de Infestação:</span>
                                    <span className="text-sm ml-2">{evaluation.infestation_level}</span>
                                  </div>
                                )}

                                {evaluation.weeds && (
                                  <div>
                                    <span className="text-sm font-medium">Plantas Daninhas:</span>
                                    <span className="text-sm ml-2">{evaluation.weeds}</span>
                                  </div>
                                )}

                                {evaluation.technical_recommendation && (
                                  <div>
                                    <span className="text-sm font-medium">Recomendação Técnica:</span>
                                    <p className="text-sm mt-1 p-2 bg-muted rounded">{evaluation.technical_recommendation}</p>
                                  </div>
                                )}

                                <div className="flex items-center space-x-2 pt-2">
                                  {evaluation.media.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {evaluation.media.length} arquivo{evaluation.media.length !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEvaluation(evaluation)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir esta avaliação? 
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteEvaluation(evaluation.id)}>
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}