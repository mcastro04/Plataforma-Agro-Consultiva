'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Visit {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: {
    id: string;
    client_id: string;
    property_id: string;
    client_name: string;
    property_name: string;
    property_city?: string;
    status: string;
    objective?: string;
  };
}

interface Client {
  id: string;
  name: string;
}

interface Property {
  id: string;
  name: string;
  city?: string;
}

interface FormData {
  client_id: string;
  property_id: string;
  scheduled_date: string;
  scheduled_time: string;
  objective: string;
}

export default function AgendaPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    client_id: '',
    property_id: '',
    scheduled_date: '',
    scheduled_time: '',
    objective: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetchVisits();
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.client_id) {
      fetchProperties(formData.client_id);
    } else {
      setProperties([]);
    }
  }, [formData.client_id]);

  const fetchVisits = async () => {
    try {
      const response = await fetch('/api/visits');
      if (response.ok) {
        const data = await response.json();
        const formattedVisits = data.map((visit: any) => ({
          id: visit.id,
          title: `${visit.client.name} - ${visit.property.name}`,
          start: new Date(visit.scheduled_date),
          end: new Date(new Date(visit.scheduled_date).getTime() + 2 * 60 * 60 * 1000), // +2 hours
          resource: {
            id: visit.id,
            client_id: visit.client_id,
            property_id: visit.property_id,
            client_name: visit.client.name,
            property_name: visit.property.name,
            property_city: visit.property.city,
            status: visit.status,
            objective: visit.objective
          }
        }));
        setVisits(formattedVisits);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar visitas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const fetchProperties = async (clientId: string) => {
    try {
      const response = await fetch(`/api/properties?client_id=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: formData.client_id,
          property_id: formData.property_id,
          scheduled_date: scheduledDateTime.toISOString(),
          objective: formData.objective
        }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Visita agendada com sucesso',
        });
        
        setIsDialogOpen(false);
        setFormData({
          client_id: '',
          property_id: '',
          scheduled_date: '',
          scheduled_time: '',
          objective: ''
        });
        fetchVisits();
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Falha ao agendar visita',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao agendar visita',
        variant: 'destructive'
      });
    }
  };

  const handleSelectEvent = useCallback((event: Visit) => {
    router.push(`/visits/${event.resource.id}`);
  }, [router]);

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
        <div className="text-center">Carregando agenda...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie suas visitas técnicas
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar Visita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agendar Nova Visita</DialogTitle>
              <DialogDescription>
                Agende uma visita técnica para um cliente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value, property_id: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
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
                <Label htmlFor="property">Propriedade *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                  disabled={!formData.client_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name} {property.city && `(${property.city})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="objective">Objetivo da Visita</Label>
                <Textarea
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="Descreva o objetivo desta visita..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={!formData.client_id || !formData.property_id || !formData.scheduled_date || !formData.scheduled_time}>
                  Agendar Visita
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={visits}
                  startAccessor="start"
                  endAccessor="end"
                  onSelectEvent={handleSelectEvent}
                  messages={{
                    next: "Próximo",
                    previous: "Anterior",
                    today: "Hoje",
                    month: "Mês",
                    week: "Semana",
                    day: "Dia",
                    agenda: "Agenda",
                    date: "Data",
                    time: "Hora",
                    event: "Visita",
                    noEventsInRange: "Nenhuma visita neste período."
                  }}
                  views={['month', 'week', 'day']}
                  defaultView="week"
                  selectable
                  popup
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximas Visitas */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximas Visitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {visits
                  .filter(visit => visit.start >= new Date())
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .slice(0, 5)
                  .map((visit) => (
                    <Card key={visit.id} className="cursor-pointer hover:bg-accent" onClick={() => handleSelectEvent(visit)}>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={getStatusColor(visit.resource.status)} className="text-xs">
                              {visit.resource.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(visit.start, 'dd/MM', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <User className="mr-1 h-3 w-3" />
                              {visit.resource.client_name}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />
                              {visit.resource.property_name}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              {format(visit.start, 'HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {visits.filter(visit => visit.start >= new Date()).length === 0 && (
                  <div className="text-center py-4">
                    <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma visita agendada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total de Visitas</span>
                  <span className="font-semibold">{visits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Agendadas</span>
                  <span className="font-semibold text-blue-600">
                    {visits.filter(v => v.resource.status === 'AGENDADA').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Realizadas</span>
                  <span className="font-semibold text-green-600">
                    {visits.filter(v => v.resource.status === 'REALIZADA').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Canceladas</span>
                  <span className="font-semibold text-red-600">
                    {visits.filter(v => v.resource.status === 'CANCELADA').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}