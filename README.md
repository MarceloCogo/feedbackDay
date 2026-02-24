# Feedback Day

Sistema de coleta de feedback diário de times, com visualização em tempo real do clima do grupo.

## 📋 O que é

O Feedback Day permite que times registrem diariamente o que funcionou bem e o que não funcionou, gerando insights sobre o ambiente de trabalho. A aplicação coleta feedbacks anônimos e os apresenta de forma visual e emocional na página Pulse.

## 🎯 Categorias

O sistema utiliza 6 categorias fixas para classificar os feedbacks:

| Categoria | Descrição |
|-----------|-----------|
| 📅 Dinâmica do dia | Como foi o ritmo e andamento do dia |
| 👥 Reuniões | Avaliação sobre as reuniões realizadas |
| 💬 Comunicação | Qualidade da comunicação entre o time |
| 🏢 Espaço de trabalho | Ambiente físico ou virtual de trabalho |
| 🎯 Foco / Produtividade | Capacidade de foco e entrega de resultados |
| 🤝 Colaboração | Trabalho em equipe e cooperação |

### Opção especial
- **➖ Nada a destacar hoje**: Quando o participante não tiver nada específico para registrar (não conta nos indicadores, mas computa no total de participantes)

## 📱 Como Usar

### Formulário de Feedback
- Acesse a página principal
- Selecione uma ou mais categorias em **"O que funcionou bem"** (verde)
- Selecione uma ou mais categorias em **"O que não funcionou bem"** (vermelho)
- A mesma categoria não pode ser selecionada em ambos os lados
- Clique em "Enviar Feedback"

### Modo Tablet
- Adicione `?mode=tablet` à URL
- O formulário reseta automaticamente após cada envio
- Ideal para deixar em um tablet na saída do escritório

### Página Pulse (Clima do Time)
- Visualização cinematográficas dark mode
- Dois painéis: positivos (verde) e negativos (vermelho)
- Grade de categorias com contadores
- Barra inferior proporcional mostrando distribuição real
- Navegação por datas (dados filtrados por dia local)
- Atualização em tempo real

### Dashboard
- Visualização analítica com gráficos
- Estatísticas detalhadas por categoria
- Atualização em tempo real

## 🗂️ Estrutura do Projeto

```
feedbackDay/
├── app/
│   ├── api/
│   │   ├── feedback/
│   │   │   ├── route.ts       # POST - Salva feedback
│   │   │   └── clear/
│   │   │       └── route.ts   # POST - Limpa dados por data
│   │   └── stats/
│   │       └── route.ts        # GET - Estatísticas
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard analítico
│   ├── pulse/
│   │   └── page.tsx            # Página do clima visual
│   ├── globals.css             # Estilos globais
│   ├── layout.tsx              # Layout principal
│   └── page.tsx                # Página de feedback
├── lib/
│   └── database.ts              # Configuração Redis
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 📊 API Endpoints

### POST /api/feedback
Salva um novo feedback anônimo.

**Body**:
```json
{
  "positive": ["Colaboração", "Comunicação"],
  "negative": ["Reuniões"],
  "date": "2024-01-15T17:30:00.000Z",
  "source": "tablet"
}
```

### GET /api/stats
Retorna estatísticas dos feedbacks.

**Query params**: `?date=2024-01-15` (opcional, filtra por dia)

**Response**:
```json
{
  "total": 42,
  "positive": {
    "Colaboração": 15,
    "Comunicação": 12
  },
  "negative": {
    "Reuniões": 8
  }
}
```

### POST /api/feedback/clear
Limpa dados de feedback.

**Query params**: `?date=2024-01-15` (opcional, limpa apenas esse dia)

## 🖥️ Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Formulário de coleta de feedback |
| `/pulse` | Visualização emocional do clima do time |
| `/dashboard` | Dashboard analítico com estatísticas |

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linting
npm run typecheck    # Verificação de tipos TypeScript
```

## 🚀 Deploy na Vercel

### Configuração

A aplicação é compatível com Vercel:

- Build otimizado para produção (Next.js 14)
- API Routes funcionam como Serverless Functions
- Redis configurado para Upstash
- Server-Sent Events para tempo real
- Acesso público sem autenticação

### Passos para Deploy

1. **Conecte à Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Importe seu repositório GitHub

2. **Configure variáveis de ambiente**:
   - `KV_REST_API_URL` - URL do Redis Upstash
   - `KV_REST_API_TOKEN` - Token de acesso Upstash

3. **Deploy**:
   - Build command: `npm run build`
   - Output directory: `.next`

### URLs após deploy

- **Feedback**: `https://seu-projeto.vercel.app`
- **Modo Tablet**: `https://seu-projeto.vercel.app?mode=tablet`
- **Dashboard**: `https://seu-projeto.vercel.app/dashboard`
- **Clima do Time**: `https://seu-projeto.vercel.app/pulse`

## 🛠 Stack Tecnológica

- **Frontend**: Next.js 14 + TypeScript
- **Estilo**: Tailwind CSS
- **Backend**: API Routes (Next.js)
- **Banco de dados**: Redis (Upstash)
- **Tempo Real**: Server-Sent Events (SSE)

## 📝 Notas Técnicas

- **Banco de dados**: Redis (Upstash) para armazenamento em nuvem
- **Filtragem por data**: Usa timezone local (America/Sao_Paulo) para precisão
- **Opção "Nada a destacar hoje"**: Não conta nos indicadores, mas computa no total de participantes
- **Prevenção de conflitos**: Formulário impede seleção da mesma categoria em positivo e negativo
- **Anonimato**: Nenhum dado pessoal ou identificável é armazenado
- **Responsivo**: Interface adaptada para TV, desktop, tablet e mobile
- **Performance**: Build estático para frontend, server-side para API routes

## ✨ Melhorias Recentes

- Layout /pulse com painéis organizados e grades responsivas
- Barra proporcional mostrando distribuição real de positivos/negativos
- Contador total mostra número de participantes (não Seleções)
- Navegação por datas com filtro preciso por timezone local
- Badges de categoria reposicionados dentro dos cards
- Formulário previne seleção da mesma categoria em ambos os lados

## 📄 Licença

MIT License
