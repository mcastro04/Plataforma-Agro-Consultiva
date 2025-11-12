# 🗺️ Guia de Navegação - Como Acessar Todas as Funcionalidades

## ✅ Todas as funcionalidades estão implementadas! Siga este guia:

---

## 1️⃣ Mapear Propriedades e Talhões

### Passo a Passo:

1. **Acesse a página de Clientes:**
   - Clique em **"Clientes"** na página inicial
   - Ou acesse diretamente: `/clients`

2. **Selecione um Cliente:**
   - Clique em **"Ver Detalhes"** no cliente desejado
   - Ou clique diretamente no nome do cliente na lista

3. **Criar Propriedade:**
   - Na página do cliente, você verá a tab **"Propriedades"**
   - Clique no botão **"Nova Propriedade"**
   - Preencha: Nome da Propriedade e Cidade
   - Clique em **"Criar Propriedade"**

4. **Criar Talhões:**
   - Na mesma página do cliente, clique em **"Ver Detalhes"** na propriedade criada
   - Na página da propriedade, você verá a seção **"Talhões"**
   - Clique no botão **"Novo Talhão"**
   - Preencha: Nome, Cultura e Área (hectares)
   - Clique em **"Criar Talhão"**

**Rota:** `/clients/[id]` → Tab "Propriedades" → `/properties/[id]` → "Novo Talhão"

---

## 2️⃣ Agendar uma Visita no Calendário

### Passo a Passo:

1. **Acesse a Agenda:**
   - Clique em **"Agenda"** na página inicial
   - Ou acesse diretamente: `/agenda`

2. **Agendar Nova Visita:**
   - Clique no botão **"Agendar Visita"** (canto superior direito)
   - Selecione o **Cliente**
   - Selecione a **Propriedade** (aparece após selecionar o cliente)
   - Escolha a **Data** e **Horário**
   - (Opcional) Adicione o **Objetivo da Visita**
   - Clique em **"Agendar Visita"**

3. **Visualizar no Calendário:**
   - A visita aparecerá no calendário
   - Você pode visualizar em: **Mês**, **Semana** ou **Dia**
   - Clique em uma visita para abrir os detalhes

**Rota:** `/agenda` → Botão "Agendar Visita"

---

## 3️⃣ Executar a Visita (Registrar Pauta e Avaliações)

### Passo a Passo:

1. **Acesse a Visita:**
   - Na **Agenda** (`/agenda`), clique em uma visita no calendário
   - Ou acesse diretamente: `/visits/[id]`

2. **Registrar Pauta com o Produtor:**
   - Na tab **"Pauta com o Produtor"**
   - Digite os pontos principais discutidos
   - Clique em **"Salvar"**

3. **Registrar Avaliações de Campo:**
   - Vá para a tab **"Avaliações de Campo"**
   - Clique em **"Adicionar Avaliação"**
   - Selecione o **Talhão** avaliado
   - Preencha:
     - Estádio Fenológico
     - Praga ou Doença Identificada
     - Nível de Infestação
     - Plantas Daninhas
     - Recomendação Técnica
   - Clique em **"Criar Avaliação"**

**Rota:** `/agenda` → Clicar na visita → `/visits/[id]`

---

## 4️⃣ Criar Pedido de Venda da Visita

### Passo a Passo:

1. **Acesse a Visita:**
   - Na página da visita (`/visits/[id]`)

2. **Criar Pedido:**
   - Vá para a tab **"Negócios/Pedidos"**
   - Clique em **"Criar Pedido"**

3. **Adicionar Itens:**
   - O **Cliente** já está preenchido (da visita)
   - Selecione o **Status** do pedido
   - Clique em **"Adicionar Item"**
   - Para cada item:
     - Selecione o **Produto** (busca assíncrona)
     - Informe a **Quantidade**
     - Informe o **Preço Unitário**
     - O **Subtotal** é calculado automaticamente
   - O **Total do Pedido** é calculado em tempo real

4. **Finalizar:**
   - Clique em **"Criar Pedido"**

**Rota:** `/visits/[id]` → Tab "Negócios/Pedidos" → "Criar Pedido"

---

## 5️⃣ Gerar Relatório PDF Profissional

### Passo a Passo:

1. **Acesse a Visita:**
   - Na página da visita (`/visits/[id]`)

2. **Gerar PDF:**
   - Vá para a tab **"Pauta com o Produtor"**
   - No canto superior direito, ao lado do botão "Salvar"
   - Clique em **"Gerar Relatório PDF"**
   - O PDF será gerado e baixado automaticamente

**O PDF inclui:**
- ✅ Informações do cliente e propriedade
- ✅ Objetivo da visita
- ✅ Pauta com o produtor
- ✅ Todas as avaliações de campo
- ✅ Recomendações técnicas
- ✅ Formatação profissional

**Rota:** `/visits/[id]` → Tab "Pauta com o Produtor" → "Gerar Relatório PDF"

---

## 🗺️ Mapa de Navegação Completo

```
Página Inicial (/)
│
├── Clientes (/clients)
│   └── Detalhes do Cliente (/clients/[id])
│       ├── Tab: Propriedades
│       │   └── Nova Propriedade → Criar
│       │   └── Ver Detalhes → /properties/[id]
│       │       └── Novo Talhão → Criar
│       ├── Tab: Visitas
│       └── Tab: Pedidos
│
├── Agenda (/agenda)
│   ├── Agendar Visita → Criar
│   └── Clicar na Visita → /visits/[id]
│       ├── Tab: Pauta com o Produtor
│       │   ├── Salvar Pauta
│       │   └── Gerar Relatório PDF ⭐
│       ├── Tab: Avaliações de Campo
│       │   └── Adicionar Avaliação → Criar
│       └── Tab: Negócios/Pedidos
│           └── Criar Pedido ⭐
│
├── Produtos (/products)
│   └── Novo Produto → Criar/Editar
│
└── Vendas (/sales)
    └── Novo Pedido → Criar
```

---

## 🎯 Fluxo Completo de Uso

### Exemplo Prático:

1. **Cadastrar Cliente:**
   - `/clients` → "Novo Cliente"

2. **Mapear Propriedade:**
   - `/clients/[id]` → Tab "Propriedades" → "Nova Propriedade"

3. **Criar Talhões:**
   - `/properties/[id]` → "Novo Talhão"

4. **Agendar Visita:**
   - `/agenda` → "Agendar Visita" → Preencher dados

5. **Executar Visita:**
   - `/agenda` → Clicar na visita → `/visits/[id]`
   - Registrar Pauta
   - Adicionar Avaliações

6. **Criar Pedido:**
   - Na mesma página da visita → Tab "Negócios/Pedidos" → "Criar Pedido"

7. **Gerar PDF:**
   - Tab "Pauta com o Produtor" → "Gerar Relatório PDF"

---

## 💡 Dicas de Navegação

- **Todos os botões "Ver Detalhes"** levam às páginas específicas
- **As Tabs** organizam as informações por contexto
- **Os botões de ação** (Plus, Edit, etc.) estão sempre visíveis
- **O calendário** é interativo - clique nas visitas para abrir

---

## ✅ Confirmação

Todas as 5 funcionalidades estão **100% implementadas e funcionais**:
- ✅ Mapear Propriedades e Talhões
- ✅ Agendar Visita no Calendário
- ✅ Executar Visita (Pauta + Avaliações)
- ✅ Criar Pedido de Venda da Visita
- ✅ Gerar Relatório PDF

Basta seguir o fluxo acima! 🚀

