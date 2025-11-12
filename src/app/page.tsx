'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, ShoppingBag, FileText, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold">Plataforma Agro-Consultiva</h1>
          <p className="text-muted-foreground">
            Sistema completo para gestão de visitas técnicas e consultoria agronômica
          </p>
        </div>
      </div>

      {/* Cards de Navegação Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/clients')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Clientes
            </CardTitle>
            <CardDescription>
              Gerencie sua carteira de clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
            <p className="text-sm text-muted-foreground">clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/agenda')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              Agenda
            </CardTitle>
            <CardDescription>
              Visualize e agende visitas técnicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short' })}
            </div>
            <p className="text-sm text-muted-foreground">visitas esta semana</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/produtos')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Package className="mr-2 h-5 w-5 text-purple-600" />
              Produtos
            </CardTitle>
            <CardDescription>
              Gerencie seu catálogo de insumos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Catálogo</div>
            <p className="text-sm text-muted-foreground">produtos e insumos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/vendas')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <ShoppingBag className="mr-2 h-5 w-5 text-orange-600" />
              Vendas
            </CardTitle>
            <CardDescription>
              Gerencie pedidos e vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Pedidos</div>
            <p className="text-sm text-muted-foreground">gestão comercial</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes Resumida */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clientes Recentes</CardTitle>
              <CardDescription>
                Últimos clientes cadastrados no sistema
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/clients')}>
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.properties.length} propriedade{client.properties.length !== 1 ? 's' : ''} • {client._count.visits} visita{client._count.visits !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  Ver Detalhes
                </Button>
              </div>
            ))}
            {clients.length === 0 && (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum cliente cadastrado ainda</p>
                <Button className="mt-4" onClick={() => router.push('/clients')}>
                  Cadastrar Primeiro Cliente
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar a Plataforma</CardTitle>
          <CardDescription>
            Guia rápido das principais funcionalidades - Clique nos cards para acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Cadastre Clientes</h3>
              <p className="text-sm text-muted-foreground">
                Adicione produtores rurais e suas informações de contato
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/clients')}
                className="w-full"
              >
                Ir para Clientes
              </Button>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Mapeie Propriedades</h3>
              <p className="text-sm text-muted-foreground">
                Clique em um cliente → Tab "Propriedades" → Nova Propriedade → Ver Detalhes → Novo Talhão
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/clients')}
                className="w-full"
              >
                Começar Aqui
              </Button>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">3. Agende Visitas</h3>
              <p className="text-sm text-muted-foreground">
                Organize sua agenda e documente avaliações técnicas
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/agenda')}
                className="w-full"
              >
                Ir para Agenda
              </Button>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">4. Crie Pedidos</h3>
              <p className="text-sm text-muted-foreground">
                Na visita → Tab "Negócios/Pedidos" → Criar Pedido
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/agenda')}
                className="w-full"
              >
                Ver Visitas
              </Button>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold">5. Gere PDF</h3>
              <p className="text-sm text-muted-foreground">
                Na visita → Tab "Pauta" → Botão "Gerar Relatório PDF"
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/agenda')}
                className="w-full"
              >
                Ver Visitas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}