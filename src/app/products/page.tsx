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
  VisibilityState,
} from '@tanstack/react-table';
import { Plus, Edit, Trash2, ArrowLeft, Package, Beaker, Search } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  type: string;
  active_ingredient?: string;
  created_at: string;
  _count: {
    orderItems: number;
  };
}

const PRODUCT_TYPES = [
  'INSETICIDA',
  'FUNGICIDA',
  'HERBICIDA',
  'FERTILIZANTE',
  'SEMENTE'
];

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  active_ingredient: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

async function createProduct(data: ProductFormValues): Promise<Product> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create product');
  }
  return response.json();
}

async function updateProduct(id: string, data: ProductFormValues): Promise<Product> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update product');
  }
  return response.json();
}

async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete product');
  }
}

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: 'Sucesso',
        description: 'Produto criado com sucesso',
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormValues }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      form.reset();
      toast({
        title: 'Sucesso',
        description: 'Produto atualizado com sucesso',
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

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso',
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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      type: '',
      active_ingredient: '',
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INSETICIDA': return 'bg-red-100 text-red-800';
      case 'FUNGICIDA': return 'bg-blue-100 text-blue-800';
      case 'HERBICIDA': return 'bg-green-100 text-green-800';
      case 'FERTILIZANTE': return 'bg-yellow-100 text-yellow-800';
      case 'SEMENTE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Produto',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue('name')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: ({ row }) => (
          <Badge className={getTypeColor(row.getValue('type'))}>
            {row.getValue('type')}
          </Badge>
        ),
        filterFn: (row, id, value) => {
          return value === '' || row.getValue(id) === value;
        },
      },
      {
        accessorKey: 'active_ingredient',
        header: 'Princípio Ativo',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Beaker className="h-4 w-4 text-muted-foreground" />
            <span>{row.getValue('active_ingredient') || '-'}</span>
          </div>
        ),
      },
      {
        accessorKey: '_count.orderItems',
        header: 'Vendas',
        cell: ({ row }) => {
          const count = row.original._count.orderItems;
          return (
            <Badge variant="outline">
              {count} venda{count !== 1 ? 's' : ''}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingProduct(product);
                  form.reset({
                    name: product.name,
                    type: product.type,
                    active_ingredient: product.active_ingredient || '',
                  });
                  setIsEditDialogOpen(true);
                }}
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
                      Tem certeza que deseja excluir o produto "{product.name}"?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate(product.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        },
      },
    ],
    [form, deleteMutation]
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  const typeFilter = columnFilters.find((filter) => filter.id === 'type')?.value as string || '';

  const onSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: values });
    } else {
      createMutation.mutate(values);
    }
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
            <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie seu portfólio de insumos agrícolas
            </p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
              <DialogDescription>
                Adicione um novo produto ao seu catálogo
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome comercial do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="active_ingredient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Princípio Ativo</FormLabel>
                      <FormControl>
                        <Input placeholder="Princípio ativo do produto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Criando...' : 'Criar Produto'}
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
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                if (value === '') {
                  setColumnFilters((prev) => prev.filter((f) => f.id !== 'type'));
                } else {
                  setColumnFilters((prev) => {
                    const filtered = prev.filter((f) => f.id !== 'type');
                    return [...filtered, { id: 'type', value }];
                  });
                }
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
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
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            {table.getFilteredRowModel().rows.length} produto{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''} encontrado{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
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
                      Nenhum produto encontrado.
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

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome comercial do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active_ingredient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Princípio Ativo</FormLabel>
                    <FormControl>
                      <Input placeholder="Princípio ativo do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Atualizando...' : 'Atualizar Produto'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

