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

## 🖥️ Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Formulário de coleta de feedback |
| `/pulse` | Visualização emocional do clima do time |
| `/dashboard` | Dashboard analítico com estatísticas |

## 📊 API

### POST /api/feedback
Salva um novo feedback anônimo.

```json
{
  "positive": ["Colaboração", "Comunicação"],
  "negative": ["Reuniões"],
  "date": "2024-01-15T17:30:00.000Z",
  "source": "tablet"
}
```

### GET /api/stats
Retorna estatísticas agregadas.

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

### DELETE /api/feedback/clear
Zera os dados de um dia específico.

Parâmetro: `?date=2024-01-15` (formato YYYY-MM-DD)

## 🛠 Stack

- **Frontend**: Next.js 14 + TypeScript
- **Estilo**: Tailwind CSS
- **Backend**: API Routes (Next.js)
- **Banco**: Redis (Upstash)
- **Tempo Real**: Server-Sent Events (SSE)

## 🔧 Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run start    # Servidor produção
npm run lint     # Linting
npm run typecheck # Verificação de tipos
```

## 📝 Notas Técnicas

- **Anonimato**: Nenhum dado pessoal é armazenado
- **Filtragem por data**: Utiliza timezone America/Sao_Paulo
- **Contador**: Reflete número de participantes, não selections
- **Conflitos**: Formulário previne seleção da mesma categoria em ambos os lados
- **Responsivo**: Funciona em TV, desktop, tablet e mobile

## 📄 Licença

MIT License
