# 🚀 Guia de Deploy na Vercel

## ⚠️ Problema: SQLite na Vercel

O SQLite **não funciona** na Vercel porque:
- A Vercel usa um sistema serverless (sem sistema de arquivos persistente)
- SQLite precisa de um arquivo físico no sistema de arquivos
- Cada execução serverless tem um sistema de arquivos temporário e isolado

## ✅ Solução: Usar PostgreSQL ou outro banco remoto

### Opção 1: Vercel Postgres (Recomendado)

1. **Criar banco na Vercel:**
   - Vá para o dashboard da Vercel
   - Selecione seu projeto
   - Vá em "Storage" → "Create Database" → "Postgres"
   - Crie o banco de dados

2. **Configurar variável de ambiente:**
   - No dashboard da Vercel, vá em "Settings" → "Environment Variables"
   - Adicione: `DATABASE_URL` com a URL fornecida pela Vercel
   - Formato: `postgresql://user:password@host:5432/database?sslmode=require`

3. **Atualizar Prisma Schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Fazer deploy:**
   - A Vercel detectará automaticamente as mudanças
   - O build executará `prisma generate` e `prisma db push`

### Opção 2: Outros provedores de PostgreSQL

- **Supabase** (gratuito): https://supabase.com
- **Neon** (gratuito): https://neon.tech
- **Railway** (gratuito): https://railway.app
- **PlanetScale** (MySQL, gratuito): https://planetscale.com

### Opção 3: Manter SQLite apenas para desenvolvimento local

Se quiser manter SQLite para desenvolvimento:

1. Crie um arquivo `.env.local` (não commitado):
   ```
   DATABASE_URL="file:./db/custom.db"
   ```

2. Use PostgreSQL na produção (Vercel):
   - Configure `DATABASE_URL` nas variáveis de ambiente da Vercel
   - Atualize o schema do Prisma para usar `postgresql` em produção

## 📝 Passos para Deploy

1. **Fazer push das mudanças:**
   ```bash
   git push origin main
   ```

2. **Configurar variáveis de ambiente na Vercel:**
   - `DATABASE_URL` - URL do banco PostgreSQL

3. **Aguardar o deploy automático**

4. **Verificar logs:**
   - Vercel Dashboard → Deployments → Logs

## 🔍 Verificações

- ✅ Build compila sem erros
- ✅ Variável `DATABASE_URL` configurada
- ✅ Prisma schema atualizado para PostgreSQL (se necessário)
- ✅ Migrations executadas (se necessário)

## 🐛 Troubleshooting

### Erro 404 NOT_FOUND
- Verifique se o build foi bem-sucedido
- Verifique os logs de deploy na Vercel
- Confirme que a variável `DATABASE_URL` está configurada

### Erro de conexão com banco
- Verifique se a URL do banco está correta
- Verifique se o banco está acessível (não bloqueado por firewall)
- Verifique se as credenciais estão corretas

### Erro de migração
- Execute `prisma db push` localmente primeiro
- Verifique se o schema está correto
- Use `prisma migrate deploy` em produção

