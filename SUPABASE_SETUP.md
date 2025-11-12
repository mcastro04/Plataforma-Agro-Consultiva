# 🚀 Configuração do Supabase na Vercel

## ✅ Você já tem o Supabase configurado!

Agora só precisa adicionar a variável de ambiente na Vercel.

## 📝 Passo 1: Adicionar DATABASE_URL na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **Plataforma-Agro-Consultiva**
3. Vá em **Settings** → **Environment Variables**
4. Clique em **Add New**
5. Configure:
   - **Name**: `DATABASE_URL`
   - **Value**: Cole este valor:
     ```
     postgres://postgres.sszfgvgbowmewepfgxpq:QLRd87hrCscqx97e@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
     ```
     (Ou use `POSTGRES_PRISMA_URL` que já está otimizada para Prisma)
   - **Environments**: Marque **Production**, **Preview** e **Development**
6. Clique em **Save**

## 📝 Passo 2: Verificar se as outras variáveis foram adicionadas

A Vercel geralmente adiciona automaticamente as variáveis do Supabase. Verifique se existem:
- `POSTGRES_URL` ✅
- `POSTGRES_PRISMA_URL` ✅ (esta é a melhor para Prisma)
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

**Importante**: O Prisma precisa de `DATABASE_URL`, então adicione essa variável mesmo que já existam as outras.

## 📝 Passo 3: Criar as Tabelas no Banco

Após configurar a variável, você precisa criar as tabelas. Execute localmente:

```bash
# Primeiro, instale as dependências se ainda não tiver
npm install

# Gere o Prisma Client
npx prisma generate

# Crie as tabelas no Supabase
npx prisma db push
```

Ou configure para executar automaticamente no build (já está configurado no package.json).

## 📝 Passo 4: Fazer Deploy

```bash
git add .
git commit -m "feat: Configura Supabase como banco de dados"
git push origin main
```

A Vercel fará o deploy automaticamente!

## ✅ Verificação

Após o deploy:
1. Acesse sua URL da Vercel
2. A página inicial deve carregar
3. Tente criar um cliente para testar o banco

## 🔍 Troubleshooting

### Erro: "Can't reach database server"
- Verifique se a URL está correta
- Verifique se o banco está ativo no Supabase Dashboard

### Erro: "relation does not exist"
- Execute `npx prisma db push` localmente
- Ou adicione ao script de build no package.json

### Erro: "Connection pool timeout"
- Use `POSTGRES_PRISMA_URL` ao invés de `POSTGRES_URL`
- Ela já tem connection pooling configurado

## 📊 URLs Importantes

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Seu Projeto**: https://sszfgvgbowmewepfgxpq.supabase.co
- **API URL**: https://sszfgvgbowmewepfgxpq.supabase.co

## 💡 Dica

Para desenvolvimento local, crie um arquivo `.env.local` (não commitado):

```env
DATABASE_URL="postgres://postgres.sszfgvgbowmewepfgxpq:QLRd87hrCscqx97e@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

