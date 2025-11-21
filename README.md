# 🍽️ Sistema de Upload de Imagens - Cardápio & Combos

Sistema moderno de gerenciamento de imagens para cardápio e combos, com armazenamento local e API pública para integração com outros sistemas.

## ✨ Funcionalidades

- **Upload de Imagens**: Interface drag-and-drop moderna
- **Categorias**: Cardápio, Combo do Dia, Combo da Tarde
- **Auto-substituição**: Cardápio anterior é deletado automaticamente
- **Edição**: Alterar descrições das imagens
- **Exclusão**: Remover imagens com confirmação
- **API Pública**: Endpoints para integração externa com CORS habilitado
- **Limpeza Automática**: Endpoint para deletar combos diariamente

## 🚀 Instalação

```bash
# Instalar dependências
pnpm install

# Criar arquivo de ambiente
cp .env.example .env.local

# Configurar variáveis (editar .env.local)
NEXT_PUBLIC_APP_NAME="Seu Restaurante"
ADMIN_PASSWORD="sua-senha-segura"
```

## 🏃 Executar

### Desenvolvimento
```bash
pnpm dev
```

### Produção
```bash
pnpm build
pnpm start
```

Acesse: `http://localhost:3000`

## 📁 Estrutura

```
├── app/
│   ├── admin/          # Página de upload (protegida)
│   ├── cardapio/       # Página pública de visualização
│   ├── api/
│   │   ├── upload/     # Upload de imagens
│   │   ├── media/      # Listar imagens (JSON)
│   │   ├── latest/     # Obter imagem mais recente
│   │   └── cron/       # Limpeza automática
│   └── lib/
│       └── db.ts       # Helper do banco JSON local
├── public/uploads/     # Imagens (criado automaticamente)
└── data/db.json        # Banco de dados (criado automaticamente)
```

## 🔌 API Endpoints

### Listar Imagens (JSON)
```
GET /api/media
GET /api/media?category=cardapio
GET /api/media?category=combo_dia
GET /api/media?category=combo_tarde
```

### Obter Imagem Mais Recente (Redirect)
```
GET /api/latest/cardapio  → Cardápio atual
GET /api/latest/dia       → Combo do dia atual
GET /api/latest/tarde     → Combo da tarde atual
```

### Limpeza Diária
```
GET /api/cron/cleanup
```

## 💡 Exemplos de Uso

### HTML
```html
<img src="http://localhost:3000/api/latest/dia" alt="Combo do Dia">
```

### JavaScript
```javascript
fetch('http://localhost:3000/api/media?category=combo_dia')
  .then(res => res.json())
  .then(data => console.log(data));
```

### cURL
```bash
curl -L http://localhost:3000/api/latest/cardapio -o cardapio.jpg
```

## ⏰ Agendamento de Limpeza

Configure um cron job para deletar combos às 19:00:

**Linux/Mac:**
```bash
# crontab -e
0 19 * * * curl http://localhost:3000/api/cron/cleanup
```

**Windows Task Scheduler:**
- Ação: `curl http://localhost:3000/api/cron/cleanup`
- Gatilho: Diariamente às 19:00

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Lucide Icons** - Ícones
- **Armazenamento Local** - Sistema de arquivos + JSON

## 📝 Notas

- **Backup**: Faça backup regular de `public/uploads/` e `data/db.json`
- **Produção**: Para deploy em plataformas serverless (Vercel), considere migrar para S3 + PostgreSQL
- **CORS**: API está aberta (`*`). Para produção, restrinja origens específicas
- **Senha Admin**: Altere `ADMIN_PASSWORD` no `.env.local`

## 📄 Licença

MIT
