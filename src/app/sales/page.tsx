'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table';
import { Plus, ArrowLeft, ShoppingBag, Calendar, User, DollarSign, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AsyncCombobox } from '@/components/ui/async-combobox';
import { toast } from '@/hooks/use-toast';

interface SalesOrder {
  id: string;
  status: string;
  created_at: string;
  total: number;
  itemsCount: number;
  client: {
    id: string;
    name: string;
  };
  visit?: {
    id: string;
    scheduled_date: string;
    property: {
      id: string;
      name: string;
    };
  };
}

interface Product {
  id: string;
  name: string;
  type: string;
}

interface Client {
  id: string;
  name: string;
}

const ORDER_STATUSES = [
  'COTAÇÃO',
  'APROVADO',
  'PEDIDO FECHADO',
  'FATURADO',
  'ENTREGUE',
  'CANCELADO'
];

const orderItemSchema = z.object({
  product_id: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  unit_price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
});

const orderSchema = z.object({
  client_id: z.string().min(1, 'Cliente é obrigatório'),
  visit_id: z.string().optional(),
  status: z.string().min(1, 'Status é obrigatório'),
  orderItems: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

async function fetchSalesOrders(): Promise<SalesOrder[]> {
  const response = await fetch('/api/sales-orders');
  if (!response.ok) {
    throw new Error('Failed to fetch sales orders');
  }
  return response.json();
}

async function searchProducts(search: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  const response = await fetch(`/api/products?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  return response.json();
}

async function searchClients(search: string): Promise<Client[]> {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  const response = await fetch(`/api/clients?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to search clients');
  }
  return response.json();
}

async function createOrder(data: OrderFormValues): Promise<SalesOrder> {
  const response = await fetch('/api/sales-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }
  return response.json();
}

export default function SalesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const { data: salesOrders = [], isLoading } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: fetchSalesOrders,
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: 'Sucesso',
        description: 'Pedido criado com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_id: '',
      visit_id: '',
      status: 'COTAÇÃO',
      orderItems: [{ product_id: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'orderItems',
  });

  const watchedItems = form.watch('orderItems');
  const total = useMemo(() => {
    return watchedItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
  }, [watchedItems]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COTAÇÃO': return 'default';
      case 'APROVADO': return 'default';
      case 'PEDIDO FECHADO': return 'default';
      case 'FATURADO': return 'default';
      case 'ENTREGUE': return 'default';
      case 'CANCELADO': return 'destructive';
      default: return 'secondary';
    }
  };

  const columns = useMemo<ColumnDef<SalesOrder>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: 'Data',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(row.getValue('created_at')).toLocaleDateString('pt-BR')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'client.name',
        header: 'Cliente',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.client.name}</span>
          </div>
        ),
        filterFn: (row, id, value) => {
          const clientName = row.original.client.name.toLowerCase();
          return clientName.includes(value.toLowerCase());
        },
      },
      {
        accessorKey: 'visit',
        header: 'Visita',
        cell: ({ row }) => {
          const visit = row.original.visit;
          return visit ? (
            <div className="text-sm">
              <div>{new Date(visit.scheduled_date).toLocaleDateString('pt-BR')}</div>
              <div className="text-muted-foreground">{visit.property.name}</div>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={getStatusColor(row.getValue('status'))}>
            {row.getValue('status')}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          return value === '' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'itemsCount',
        header: 'Itens',
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.getValue('itemsCount')} item{row.getValue('itemsCount') !== 1 ? 's' : ''}
          </Badge>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">
              R$ {row.getValue('total').toFixed(2)}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/vendas/${row.original.id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: salesOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const statusFilter = columnFilters.find((filter) => filter.id === 'status')?.value as string || '';

  const onSubmit = (values: OrderFormValues) => {
    createMutation.mutate(values);
  };

  if (isLoading) {
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
            <h1 className="text-3xl font-bold">Gestão de Vendas</h1>
            <p className="text-muted-foreground">
              Gerencie pedidos e vendas para seus clientes
            </p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Pedido de Venda</DialogTitle>
              <DialogDescription>
                Crie um novo pedido para um cliente
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente *</FormLabel>
                        <FormControl>
                          <AsyncCombobox
                            queryKey={['clients']}
                            queryFn={searchClients}
                            value={field.value}
                            onSelect={field.onChange}
                            getOptionLabel={(client) => client.name}
                            getOptionValue={(client) => client.id}
                            placeholder="Selecione o cliente"
                            searchPlaceholder="Buscar cliente..."
                            emptyMessage="Nenhum cliente encontrado"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ORDER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <FormLabel>Itens do Pedido</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ product_id: '', quantity: 1, unit_price: 0 })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Item {index + 1}</span>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              Remover
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <FormField
                            control={form.control}
                            name={`orderItems.${index}.product_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Produto *</FormLabel>
                                <FormControl>
                                  <AsyncCombobox
                                    queryKey={['products']}
                                    queryFn={searchProducts}
                                    value={field.value}
                                    onSelect={field.onChange}
                                    getOptionLabel={(product) => product.name}
                                    getOptionValue={(product) => product.id}
                                    placeholder="Selecione o produto"
                                    searchPlaceholder="Buscar produto..."
                                    emptyMessage="Nenhum produto encontrado"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`orderItems.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Quantidade *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`orderItems.${index}.unit_price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Preço Unitário *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-end">
                            <div>
                              <FormLabel className="text-sm">Subtotal</FormLabel>
                              <div className="font-medium mt-2">
                                R$ {(watchedItems[index]?.quantity * watchedItems[index]?.unit_price || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {fields.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total do Pedido:</span>
                      <span className="text-lg font-bold text-green-600">
                        R$ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || fields.length === 0}
                  >
                    {createMutation.isPending ? 'Criando...' : 'Criar Pedido'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Input
                placeholder="Buscar por cliente..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (value === '') {
                  setColumnFilters((prev) => prev.filter((f) => f.id !== 'status'));
                } else {
                  setColumnFilters((prev) => {
                    const filtered = prev.filter((f) => f.id !== 'status');
                    return [...filtered, { id: 'status', value }];
                  });
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos de Venda</CardTitle>
          <CardDescription>
            {table.getFilteredRowModel().rows.length} pedido{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''} encontrado{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

