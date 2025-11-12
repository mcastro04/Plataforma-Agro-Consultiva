# 🚀 Setup Rápido na Vercel

## 🎯 Opções de Banco de Dados Disponíveis

A Vercel oferece várias opções através do Marketplace. Para este projeto, as melhores opções são:

### ⭐ Opção 1: Turso (Serverless SQLite) - RECOMENDADO
**Por quê?** 
- ✅ Mantém SQLite (não precisa mudar o schema)
- ✅ Serverless e rápido
- ✅ Gratuito generoso
- ✅ Compatível com Prisma

### ⭐ Opção 2: Neon (Serverless Postgres)
**Por quê?**
- ✅ PostgreSQL completo
- ✅ Serverless
- ✅ Gratuito generoso
- ✅ Muito rápido

### ⭐ Opção 3: Supabase (Postgres)
**Por quê?**
- ✅ PostgreSQL completo
- ✅ Interface web excelente
- ✅ Gratuito generoso
- ✅ Muitos recursos extras

### ⭐ Opção 4: Prisma Postgres
**Por quê?**
- ✅ Otimizado para Prisma
- ✅ Serverless
- ✅ Integração perfeita

---

## 🚀 Setup com Turso (SQLite Serverless) - MAIS FÁCIL

### Passo 1: Criar Banco no Turso

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **Plataforma-Agro-Consultiva**
3. Vá em **Storage** → **Marketplace**
4. Procure por **Turso**
5. Clique em **Add Integration**
6. Siga as instruções para criar conta no Turso (se necessário)
7. Crie um novo banco de dados
8. Copie a **Database URL** fornecida

### Passo 2: Configurar Variável de Ambiente

1. No projeto Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name**: `DATABASE_URL`
   - **Value**: Cole a URL do Turso (formato: `libsql://...`)
   - **Environments**: Marque todos (Production, Preview, Development)
3. Clique em **Save**

### Passo 3: Atualizar Schema do Prisma

O schema já está configurado! Mas se quiser usar Turso, você pode manter SQLite:

```prisma
datasource db {
  provider = "sqlite"  // Turso usa SQLite
  url      = env("DATABASE_URL")
}
```

Ou usar o driver específico do Turso (mais recomendado):
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  relationMode = "prisma"  // Para Turso
}
```

---

## 🚀 Setup com Neon (PostgreSQL Serverless)

### Passo 1: Criar Banco no Neon

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **Plataforma-Agro-Consultiva**
3. Vá em **Storage** → **Marketplace**
4. Procure por **Neon**
5. Clique em **Add Integration**
6. Siga as instruções para criar conta no Neon
7. Crie um novo projeto
8. Copie a **Connection String** (formato: `postgresql://...`)

### Passo 2: Configurar Variável de Ambiente

1. No projeto Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name**: `DATABASE_URL`
   - **Value**: Cole a Connection String do Neon
   - **Environments**: Marque todos
3. Clique em **Save**

### Passo 3: Schema já está configurado!

O Prisma já está configurado para PostgreSQL, então está pronto!

---

## 🚀 Setup com Supabase (PostgreSQL)

### Passo 1: Criar Banco no Supabase

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **Plataforma-Agro-Consultiva**
3. Vá em **Storage** → **Marketplace**
4. Procure por **Supabase**
5. Clique em **Add Integration**
6. Siga as instruções para criar conta no Supabase
7. Crie um novo projeto
8. Vá em **Settings** → **Database** → **Connection string**
9. Copie a **Connection string** (URI format)

### Passo 2: Configurar Variável de Ambiente

1. No projeto Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name**: `DATABASE_URL`
   - **Value**: Cole a Connection String do Supabase
   - **Environments**: Marque todos
3. Clique em **Save**

### Passo 2: Configurar Variável de Ambiente

1. No mesmo projeto, vá em **Settings** → **Environment Variables**
2. Você verá que a Vercel já criou automaticamente a variável `POSTGRES_URL`
3. **IMPORTANTE**: Renomeie ou adicione como `DATABASE_URL`:
   - Clique em **Add New**
   - Name: `DATABASE_URL`
   - Value: Cole o valor de `POSTGRES_URL` (ou use a mesma URL)
   - Environments: Marque **Production**, **Preview** e **Development**
   - Clique em **Save**

### Passo 3: Fazer Deploy

Após configurar a variável `DATABASE_URL`, faça push:

```bash
git add .
git commit -m "feat: Configura banco de dados na Vercel"
git push origin main
```

A Vercel irá:
1. Detectar o push
2. Executar `npm install`
3. Executar `prisma generate`
4. Executar `npm run build`
5. Fazer deploy automaticamente

### Passo 4: Criar Tabelas no Banco

Após o primeiro deploy, você precisa criar as tabelas. Execute localmente:

```bash
# Para Turso (SQLite)
npx prisma db push

# Para Neon/Supabase (PostgreSQL)
npx prisma db push
```

Ou configure um script no `package.json` para executar automaticamente no build (já está configurado).

**Nota**: Se usar Turso, você pode precisar instalar o driver:
```bash
npm install @libsql/client
```

## ✅ Verificação

Após o deploy:
1. Acesse sua URL da Vercel (ex: `plataforma-agro-consultiva.vercel.app`)
2. A página inicial deve carregar
3. Tente criar um cliente para testar o banco

## 🐛 Se ainda der 404

1. **Verifique os logs:**
   - Vercel Dashboard → **Deployments** → Clique no último deploy → **Logs**

2. **Verifique se DATABASE_URL está configurada:**
   - Settings → Environment Variables
   - Deve existir `DATABASE_URL`

3. **Verifique se o build passou:**
   - Deployments → Build Logs
   - Deve mostrar "Build successful"

4. **Teste a conexão:**
   - Vercel Dashboard → Storage → Seu banco → **Connect**
   - Teste uma query simples

## 📊 Comparação Rápida

| Opção | Tipo | Dificuldade | Recomendado Para |
|-------|------|-------------|------------------|
| **Turso** | SQLite Serverless | ⭐ Fácil | Manter SQLite, setup rápido |
| **Neon** | PostgreSQL Serverless | ⭐⭐ Médio | PostgreSQL completo, muito rápido |
| **Supabase** | PostgreSQL | ⭐⭐ Médio | PostgreSQL + recursos extras |
| **Prisma Postgres** | PostgreSQL | ⭐⭐ Médio | Otimizado para Prisma |

## 💡 Recomendação

**Para começar rápido**: Use **Turso** (mantém SQLite, menos mudanças)

**Para produção robusta**: Use **Neon** ou **Supabase** (PostgreSQL completo)

## 📝 Nota sobre KV/Redis

O Vercel KV (Redis) **não funciona** com Prisma porque:
- Prisma não suporta Redis diretamente
- Este projeto precisa de relacionamentos SQL
- KV é apenas key-value, sem joins ou relacionamentos

**Use Turso, Neon, Supabase ou Prisma Postgres** - todos funcionam perfeitamente!

