'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, User, Wheat, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface Property {
  id: string;
  name: string;
  city?: string;
  created_at: string;
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  plots: Array<{
    id: string;
    name: string;
    crop?: string;
    area_hectares?: number;
    created_at: string;
    _count: {
      plotEvaluations: number;
    };
  }>;
  visits: Array<{
    id: string;
    scheduled_date: string;
    status: string;
    objective?: string;
    discussion_summary?: string;
  }>;
  _count: {
    plots: number;
    visits: number;
  };
}

interface PlotFormData {
  name: string;
  crop: string;
  area_hectares: string;
}

const CROP_OPTIONS = [
  'Soja',
  'Milho',
  'Algodão',
  'Cana-de-açúcar',
  'Café',
  'Trigo',
  'Arroz',
  'Feijão',
  'Outra'
];

export default function PropertyDetailsPage() {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlotDialogOpen, setIsPlotDialogOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<any>(null);
  const [plotFormData, setPlotFormData] = useState<PlotFormData>({
    name: '',
    crop: '',
    area_hectares: ''
  });

  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Propriedade não encontrada',
          variant: 'destructive'
        });
        router.push('/');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar propriedade',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPlot ? `/api/plots/${editingPlot.id}` : '/api/plots';
      const method = editingPlot ? 'PUT' : 'POST';
      const body = {
        ...plotFormData,
        area_hectares: plotFormData.area_hectares || null,
        ...(editingPlot ? {} : { property_id: propertyId })
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
          description: editingPlot ? 'Talhão atualizado com sucesso' : 'Talhão criado com sucesso',
        });
        
        setIsPlotDialogOpen(false);
        setEditingPlot(null);
        setPlotFormData({ name: '', crop: '', area_hectares: '' });
        fetchProperty();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao salvar talhão',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar talhão',
        variant: 'destructive'
      });
    }
  };

  const handleEditPlot = (plot: any) => {
    setEditingPlot(plot);
    setPlotFormData({
      name: plot.name,
      crop: plot.crop || '',
      area_hectares: plot.area_hectares?.toString() || ''
    });
    setIsPlotDialogOpen(true);
  };

  const handleDeletePlot = async (plotId: string) => {
    try {
      const response = await fetch(`/api/plots/${plotId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Talhão excluído com sucesso',
        });
        fetchProperty();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao excluir talhão',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir talhão',
        variant: 'destructive'
      });
    }
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
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Propriedade não encontrada</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push(`/clients/${property.client.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  {property.client.name}
                </div>
                {property.city && (
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {property.city}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-sm">
                {property._count.plots} talhõ{property._count.plots !== 1 ? 'es' : 'es'}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {property._count.visits} visita{property._count.visits !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Talhões */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Talhões</CardTitle>
                <CardDescription>
                  Áreas produtivas da propriedade
                </CardDescription>
              </div>
              <Dialog open={isPlotDialogOpen} onOpenChange={setIsPlotDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Talhão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPlot ? 'Editar Talhão' : 'Novo Talhão'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPlot ? 'Atualize as informações do talhão' : 'Adicione um novo talhão à propriedade'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePlotSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="plotName">Nome do Talhão *</Label>
                      <Input
                        id="plotName"
                        value={plotFormData.name}
                        onChange={(e) => setPlotFormData({ ...plotFormData, name: e.target.value })}
                        placeholder="Ex: Talhão 01, Norte, Centro"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="crop">Cultura</Label>
                      <Select
                        value={plotFormData.crop}
                        onValueChange={(value) => setPlotFormData({ ...plotFormData, crop: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cultura" />
                        </SelectTrigger>
                        <SelectContent>
                          {CROP_OPTIONS.map((crop) => (
                            <SelectItem key={crop} value={crop}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="area">Área (hectares)</Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.01"
                        value={plotFormData.area_hectares}
                        onChange={(e) => setPlotFormData({ ...plotFormData, area_hectares: e.target.value })}
                        placeholder="Ex: 25.5"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {editingPlot ? 'Atualizar' : 'Criar'} Talhão
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {property.plots.length === 0 ? (
              <div className="text-center py-8">
                <Wheat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum talhão cadastrado</p>
                <p className="text-sm text-muted-foreground">Adicione o primeiro talhão desta propriedade</p>
              </div>
            ) : (
              <div className="space-y-3">
                {property.plots.map((plot) => (
                  <Card key={plot.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{plot.name}</h3>
                            {plot.crop && (
                              <Badge variant="outline" className="text-xs">
                                <Wheat className="mr-1 h-3 w-3" />
                                {plot.crop}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            {plot.area_hectares && (
                              <div className="flex items-center">
                                <Square className="mr-1 h-3 w-3" />
                                {plot.area_hectares} ha
                              </div>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {plot._count.plotEvaluations} avaliação{plot._count.plotEvaluations !== 1 ? 'ões' : ''}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlot(plot)}
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
                                  Tem certeza que deseja excluir o talhão "{plot.name}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePlot(plot.id)}>
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

        {/* Visitas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Visitas Recentes</CardTitle>
            <CardDescription>
              Histórico de visitas nesta propriedade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {property.visits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma visita realizada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {property.visits.slice(0, 5).map((visit) => (
                  <Card key={visit.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {new Date(visit.scheduled_date).toLocaleDateString('pt-BR')}
                            </span>
                            <Badge variant={getStatusColor(visit.status)} className="text-xs">
                              {visit.status}
                            </Badge>
                          </div>
                          {visit.objective && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {visit.objective}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {property.visits.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      Ver todas as visitas ({property.visits.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo da Propriedade */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Propriedade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{property._count.plots}</div>
              <div className="text-sm text-muted-foreground">Talhões</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{property._count.visits}</div>
              <div className="text-sm text-muted-foreground">Visitas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {property.plots.reduce((sum, plot) => sum + (plot.area_hectares || 0), 0).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Área Total (ha)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {property.plots.filter(plot => plot.crop).length}
              </div>
              <div className="text-sm text-muted-foreground">Culturas Plantadas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}