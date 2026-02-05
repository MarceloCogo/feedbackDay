# Feedback Day

## 🔓 Configuração de Acesso Público

Para garantir acesso público na Vercel, verifique estas configurações:

### 1️⃣ Na Vercel Dashboard:
- Vá para **Settings → Functions**
- Desative **"Require Authentication"**
- Desative **"Password Protection"**

### 2️⃣ Para Domínio Personalizado:
- Vá para **Settings → Domains**
- Adicione seu domínio público
- Configure DNS se necessário

### 3️⃣ Branch Protections:
- Verifique se a branch `main` não está protegida
- GitHub pode estar bloqueando acesso público

### 4️⃣ Arquivo `vercel.json` está correto:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "nextjs"
}
```

### 5️⃣ URLs Públicas:
- **Production**: `https://seu-projeto.vercel.app`
- **Preview**: `https://preview-seu-projeto.vercel.app`

## 🚀 Deploy Público Confirmado

O projeto está configurado para acesso público sem autenticação!

## 📱 Como Usar

### Para Feedback via Link
- Acesse `https://seu-projeto.vercel.app`
- Selecione as opções positivas e negativas
- Clique em "Enviar Feedback"

### Para Feedback em Tablet
- Acesse `https://seu-projeto.vercel.app?mode=tablet`
- O fluxo resetará automaticamente após cada envio
- Ideal para deixar em um tablet na saída do escritório

### Para Visualizar Dashboard
- Acesse `https://seu-projeto.vercel.app/dashboard`
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
- ✅ Acesso público configurado

### Passos para Deploy:

1. **Push para GitHub**:
   ```bash
   git add .
   git commit -m "Add public access configuration"
   git push origin main
   ```

2. **Conecte à Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Importe seu repositório GitHub
   - O framework Next.js será detectado automaticamente

3. **Configure Acesso Público**:
   - Vá para **Settings → Functions**
   - Desative **"Require Authentication"**
   - Desative **"Password Protection"**

4. **Deploy automático**:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

### URLs após deploy:
- **Feedback**: `https://seu-projeto.vercel.app`
- **Modo Tablet**: `https://seu-projeto.vercel.app?mode=tablet`
- **Dashboard**: `https://seu-projeto.vercel.app/dashboard`

## 🛠 Stack Tecnológica

- **Frontend**: Next.js 14.2 + TypeScript
- **Estilo**: Tailwind CSS
- **Gráficos**: Recharts
- **Backend**: API Routes (Next.js)
- **Banco de dados**: SQLite3
- **Tempo Real**: Server-Sent Events (SSE)
- **Node.js**: 24.x (compatibilidade Vercel)

## 📝 Notas Técnicas

- **Banco de dados**: SQLite criado automaticamente na primeira execução (`feedback.db`)
- **Anonimato**: Nenhum dado pessoal ou identificável é armazenado
- **Responsivo**: Interface adaptada para desktop, tablet e mobile
- **Performance**: Build estático para frontend, server-side para API routes
- **Acesso Público**: Configurado para funcionar sem autenticação

## 🤝 Contribuições

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License