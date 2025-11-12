'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Building, MapPin, Phone, Mail, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface Client {
  id: string;
  name: string;
  cpf_cnpj?: string;
  phone?: string;
  email?: string;
  created_at: string;
  properties: Array<{
    id: string;
    name: string;
    city?: string;
    plots: Array<{
      id: string;
      name: string;
      crop?: string;
      area_hectares?: number;
    }>;
  }>;
  visits: Array<{
    id: string;
    scheduled_date: string;
    status: string;
    objective?: string;
    property: {
      id: string;
      name: string;
    };
  }>;
  salesOrders: Array<{
    id: string;
    status: string;
    created_at: string;
    _count: {
      orderItems: number;
    };
  }>;
}

interface PropertyFormData {
  name: string;
  city: string;
}

export default function ClientDetailsPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [propertyFormData, setPropertyFormData] = useState<PropertyFormData>({
    name: '',
    city: ''
  });

  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Cliente não encontrado',
          variant: 'destructive'
        });
        router.push('/');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar cliente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProperty ? `/api/properties/${editingProperty.id}` : '/api/properties';
      const method = editingProperty ? 'PUT' : 'POST';
      const body = editingProperty 
        ? { name: propertyFormData.name, city: propertyFormData.city }
        : { client_id: clientId, name: propertyFormData.name, city: propertyFormData.city };
      
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
          description: editingProperty ? 'Propriedade atualizada com sucesso' : 'Propriedade criada com sucesso',
        });
        
        setIsPropertyDialogOpen(false);
        setEditingProperty(null);
        setPropertyFormData({ name: '', city: '' });
        fetchClient();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao salvar propriedade',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar propriedade',
        variant: 'destructive'
      });
    }
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setPropertyFormData({
      name: property.name,
      city: property.city || ''
    });
    setIsPropertyDialogOpen(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Propriedade excluída com sucesso',
        });
        fetchClient();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao excluir propriedade',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir propriedade',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGENDADA': return 'default';
      case 'REALIZADA': return 'default';
      case 'CANCELADA': return 'destructive';
      case 'COTAÇÃO': return 'secondary';
      case 'APROVADO': return 'default';
      case 'PEDIDO FECHADO': return 'default';
      case 'FATURADO': return 'default';
      case 'ENTREGUE': return 'default';
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

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Cliente não encontrado</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                {client.cpf_cnpj && <span>CPF/CNPJ: {client.cpf_cnpj}</span>}
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="mr-1 h-4 w-4" />
                    {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center">
                    <Mail className="mr-1 h-4 w-4" />
                    {client.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Propriedades ({client.properties.length})</TabsTrigger>
          <TabsTrigger value="visits">Visitas ({client.visits.length})</TabsTrigger>
          <TabsTrigger value="orders">Pedidos ({client.salesOrders.length})</TabsTrigger>
        </TabsList>

        {/* Propriedades Tab */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Propriedades</CardTitle>
                  <CardDescription>
                    Gerencie as fazendas e propriedades deste cliente
                  </CardDescription>
                </div>
                <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Propriedade
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingProperty ? 'Editar Propriedade' : 'Nova Propriedade'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProperty ? 'Atualize as informações da propriedade' : 'Adicione uma nova propriedade'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePropertySubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome da Propriedade *</Label>
                        <Input
                          id="name"
                          value={propertyFormData.name}
                          onChange={(e) => setPropertyFormData({ ...propertyFormData, name: e.target.value })}
                          placeholder="Nome da fazenda"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={propertyFormData.city}
                          onChange={(e) => setPropertyFormData({ ...propertyFormData, city: e.target.value })}
                          placeholder="Cidade"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">
                          {editingProperty ? 'Atualizar' : 'Criar'} Propriedade
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {client.properties.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma propriedade cadastrada</p>
                  <p className="text-sm text-muted-foreground">Adicione a primeira propriedade deste cliente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {client.properties.map((property) => (
                    <Card key={property.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg">{property.name}</h3>
                              {property.city && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {property.city}
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <Badge variant="outline">
                                {property.plots.length} talhão{property.plots.length !== 1 ? 'ões' : ''}
                              </Badge>
                            </div>
                            {property.plots.length > 0 && (
                              <div className="mt-3 text-sm text-muted-foreground">
                                Talhões: {property.plots.map(p => p.name).join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/properties/${property.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProperty(property)}
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
                                    Tem certeza que deseja excluir a propriedade "{property.name}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProperty(property.id)}>
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

        {/* Visitas Tab */}
        <TabsContent value="visits">
          <Card>
            <CardHeader>
              <CardTitle>Visitas</CardTitle>
              <CardDescription>
                Histórico de visitas técnicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {client.visits.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma visita realizada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Propriedade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Objetivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.visits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell>
                          {new Date(visit.scheduled_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{visit.property.name}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(visit.status)}>
                            {visit.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {visit.objective || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pedidos Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
              <CardDescription>
                Histórico de pedidos de venda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {client.salesOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum pedido realizado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Itens</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.salesOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order._count.orderItems} itens</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}