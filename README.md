# Feedback Day

Sistema de feedback rápido e anônimo para colaboradores, usado como check-out presencial em tablet e também via link.

## 🚀 Funcionalidades

- **Feedback anônimo** - Sem login ou identificação de usuário
- **Interface touch-friendly** - Botões grandes e responsivos
- **Dois modos de uso**:
  - Modo tablet (`/feedback?mode=tablet`) - Reset automático após 4 segundos
  - Modo link (`/feedback`) - Encerra fluxo após envio
- **Dashboard em tempo real** - Gráficos e estatísticas com auto-refresh
- **Dados anonimizados** - Não armazena IP, user-agent ou qualquer dado identificável

## 📱 Fluxo de Feedback

1. **Tela 1**: "O que funcionou bem hoje?" - Seleção múltipla com opções verdes
2. **Tela 2**: "O que não funcionou bem hoje?" - Seleção múltipla com opções vermelhas
3. **Confirmação**: Mensagem de sucesso e reset (modo tablet) ou encerramento (modo link)

## 🏷️ Categorias

- Dinâmica do dia
- Reuniões
- Comunicação
- Espaço de trabalho
- Foco / Produtividade
- Colaboração

## 🛠 Stack Tecnológica

- **Frontend**: Next.js 14.2 + TypeScript
- **Estilo**: Tailwind CSS
- **Gráficos**: Recharts
- **Backend**: API Routes (Next.js)
- **Banco de dados**: SQLite3
- **Tempo Real**: Server-Sent Events (SSE)
- **Node.js**: 24.x (compatibilidade Vercel)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🚀 Instalação e Execução

1. **Clone o repositório**:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd feedbackDay
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**:
   - Feedback: http://localhost:3000
   - Modo Tablet: http://localhost:3000?mode=tablet
   - Dashboard: http://localhost:3000/dashboard

## 📱 Como Usar

### Para Feedback via Link
- Acesse `http://localhost:3000`
- Selecione as opções positivas e negativas
- Clique em "Enviar Feedback"

### Para Feedback em Tablet
- Acesse `http://localhost:3000?mode=tablet`
- O fluxo resetará automaticamente após cada envio
- Ideal para deixar em um tablet na saída do escritório

### Para Visualizar Dashboard
- Acesse `http://localhost:3000/dashboard`
- **Visualize estatísticas em TEMPO REAL** ⚡
- Dashboard atualiza instantaneamente quando novos feedbacks são recebidos
- Indicador verde piscando mostra conexão ativa
- Fallback automático para polling a cada 10 segundos se SSE falhar

## 🗂️ Estrutura do Projeto

```
feedbackDay/
├── app/
│   ├── api/
│   │   ├── feedback/      # API para salvar feedbacks
│   │   └── stats/         # API para estatísticas
│   ├── dashboard/         # Página do dashboard
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de feedback
├── lib/
│   └── database.ts        # Configuração do SQLite
├── components/            # Componentes reutilizáveis
└── utils/                 # Utilitários
```

## 📊 API Endpoints

### POST /api/feedback
Salva um novo feedback.

**Body**:
```json
{
  "positive": ["Colaboração", "Comunicação"],
  "negative": ["Reuniões"],
  "date": "2024-01-15T17:30:00.000Z",
  "source": "tablet" // ou "link"
}
```

### GET /api/stats
Retorna estatísticas dos feedbacks.

**Response**:
```json
{
  "total": 42,
  "positive": {
    "Colaboração": 15,
    "Comunicação": 12,
    // ...
  },
  "negative": {
    "Reuniões": 8,
    // ...
  }
}
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linting
- `npm run typecheck` - Verificação de tipos TypeScript

## 🚀 Deploy na Vercel

### Configuração ✅

A aplicação está **100% compatível com Vercel**:

- ✅ Build otimizado para produção (Next.js 14.2)
- ✅ API Routes funcionam como Serverless Functions  
- ✅ SQLite3 configurado para `/tmp/` (diretório temporário da Vercel)
- ✅ Node.js 24.x para máxima compatibilidade
- ✅ Build estático + server-side rendering
- ✅ Server-Sent Events para tempo real

### Passos para Deploy:

1. **Push para GitHub**:
   ```bash
   git add .
   git commit -m "Add feedback app"
   git push origin main
   ```

2. **Conecte à Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Importe seu repositório GitHub
   - O framework Next.js será detectado automaticamente

3. **Deploy automático**:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

### URLs após deploy:
- **Feedback**: `https://seu-projeto.vercel.app`
- **Modo Tablet**: `https://seu-projeto.vercel.app?mode=tablet`
- **Dashboard**: `https://seu-projeto.vercel.app/dashboard`

### Notas Técnicas:
- SQLite é criado em `/tmp/feedback.db` (persistente durante a vida útil da função)
- Banco de dados é inicializado automaticamente no primeiro acesso
- Sem necessidade de variáveis de ambiente
- Build e deploy sem configuração manual

## 📝 Notas Técnicas

- **Banco de dados**: SQLite criado automaticamente na primeira execução (`feedback.db`)
- **Anonimato**: Nenhum dado pessoal ou identificável é armazenado
- **Responsivo**: Interface adaptada para desktop, tablet e mobile
- **Performance**: Build estático para frontend, server-side para API routes

## 🤝 Contribuições

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License