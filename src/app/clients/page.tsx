'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Phone, Mail, Building, Eye, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
  }>;
  _count: {
    visits: number;
    salesOrders: number;
  };
}

interface ClientFormData {
  name: string;
  cpf_cnpj: string;
  phone: string;
  email: string;
}

export default function ClientsListPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    cpf_cnpj: '',
    phone: '',
    email: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar clientes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: editingClient ? 'Cliente atualizado com sucesso' : 'Cliente criado com sucesso',
        });
        
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingClient(null);
        setFormData({ name: '', cpf_cnpj: '', phone: '', email: '' });
        fetchClients();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao salvar cliente',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar cliente',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      cpf_cnpj: client.cpf_cnpj || '',
      phone: client.phone || '',
      email: client.email || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Cliente excluído com sucesso',
        });
        fetchClients();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao excluir cliente',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir cliente',
        variant: 'destructive'
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf_cnpj?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie sua carteira de clientes
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/agenda')}>
            <Calendar className="mr-2 h-4 w-4" />
            Agenda
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription>
                  Adicione um novo cliente à sua carteira
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do produtor rural"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CPF/CNPJ</label>
                  <Input
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Criar Cliente</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Propriedades</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        {client.cpf_cnpj && (
                          <div className="text-sm text-muted-foreground">
                            {client.cpf_cnpj}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {client.phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {client.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{client.properties.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {client._count.visits}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {client._count.salesOrders}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/clients/${client.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(client)}
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
                              Tem certeza que deseja excluir o cliente "{client.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(client.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do produtor rural"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">CPF/CNPJ</label>
              <Input
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Atualizar Cliente</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}