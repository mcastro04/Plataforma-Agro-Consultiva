#!/bin/bash

echo "🔍 Diagnosticando problema ao criar cliente..."
echo ""

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL não encontrada. Configurando..."
    export DATABASE_URL="postgres://postgres.sszfgvgbowmewepfgxpq:QLRd87hrCscqx97e@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
fi

echo "📦 Gerando Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Criando tabelas no banco de dados..."
npx prisma db push --accept-data-loss

echo ""
echo "✅ Concluído! Tente criar o cliente novamente."

