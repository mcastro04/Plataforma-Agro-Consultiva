# 🗄️ Como Criar as Tabelas no Banco de Dados

## ⚠️ IMPORTANTE: Execute isso ANTES de usar a aplicação!

O banco de dados precisa ter as tabelas criadas. Siga estes passos:

## 📝 Passo 1: Configurar Variável de Ambiente Local

Crie um arquivo `.env.local` na raiz do projeto:

```bash
DATABASE_URL="postgres://postgres.sszfgvgbowmewepfgxpq:QLRd87hrCscqx97e@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

## 📝 Passo 2: Gerar Prisma Client

```bash
npx prisma generate
```

## 📝 Passo 3: Criar as Tabelas no Banco

```bash
npx prisma db push
```

Este comando irá:
- ✅ Criar todas as tabelas no Supabase
- ✅ Aplicar o schema do Prisma
- ✅ Configurar relacionamentos

## 📝 Passo 4: Verificar se Funcionou

Após executar `prisma db push`, você deve ver uma mensagem de sucesso.

## 🔍 Se Der Erro

### Erro: "Environment variable not found: DATABASE_URL"
- Verifique se o arquivo `.env.local` existe
- Verifique se a URL está correta

### Erro: "Can't reach database server"
- Verifique se o Supabase está ativo
- Verifique se a URL está correta
- Verifique se não há firewall bloqueando

### Erro: "relation already exists"
- As tabelas já existem, está tudo certo!

## ✅ Após Criar as Tabelas

Agora você pode:
- ✅ Criar clientes
- ✅ Criar propriedades
- ✅ Criar talhões
- ✅ Agendar visitas
- ✅ Criar pedidos
- ✅ Gerar PDFs

---

## 🚀 Comando Rápido (Tudo de Uma Vez)

```bash
# Configure a variável e execute:
export DATABASE_URL="postgres://postgres.sszfgvgbowmewepfgxpq:QLRd87hrCscqx97e@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
npx prisma generate
npx prisma db push
```

