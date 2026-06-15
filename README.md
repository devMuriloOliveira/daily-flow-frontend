# DailyFlow — Frontend

Aplicação web e **PWA** (Progressive Web App) para organização de rotina diária. O DailyFlow ajuda a planejar tarefas, acompanhar o progresso do dia e visualizar estatísticas de desempenho.

## Stack

- [Vue 3](https://vuejs.org/) com Composition API (`<script setup>`)
- [Vite](https://vitejs.dev/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Axios](https://axios-http.com/) — integração com API REST
- [ApexCharts](https://apexcharts.com/) + [vue3-apexcharts](https://github.com/apexcharts/vue3-apexcharts)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — PWA instalável

## Principais telas

| Rota | Tela | Descrição |
|------|------|-----------|
| `/login` | Login | Autenticação com e-mail e senha |
| `/register` | Cadastro | Criação de conta |
| `/dashboard` | Dashboard | Tarefas do dia, progresso e navegação entre datas |
| `/create-task` | Nova tarefa | Formulário de criação |
| `/edit-task/:id` | Editar tarefa | Mesmo formulário, em modo edição |
| `/agenda` | Agenda | Calendário mensal com tarefas por data |
| `/statistics` | Estatísticas | Métricas e gráfico semanal |

## Funcionalidades

- **Tarefas por dia** — visualização e conclusão na Dashboard, com navegação entre dias
- **Tarefa única** — tarefa pontual com data e horário opcional
- **Recorrência por dias da semana** — seleção de dias com horários diferentes por dia
- **Ciclo flexível** — padrão de dias ativos e dias de descanso a partir de uma data inicial
- **Prioridades** — alta, média e baixa
- **Categorias** — academia, estudos, trabalho, casa, finanças, pessoal
- **Gráfico de conclusão** — barras com tarefas concluídas por dia da semana
- **Ofensiva (streak)** — dados de sequência atual e melhor sequência via API de estatísticas
- **PWA instalável** — pode ser adicionado à tela inicial do celular
- **Layout responsivo** — adaptado para desktop e mobile

## Pré-requisitos

- Node.js 18+
- npm
- Backend DailyFlow em execução (veja [../backend/README.md](../backend/README.md))

## Instalação

```bash
cd frontend
npm install
```

## Configuração do ambiente

Copie o arquivo de exemplo e ajuste a URL da API:

```bash
cp .env.example .env
```

Variáveis disponíveis:

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API REST (ex.: `http://localhost:3333`) |

> Variáveis prefixadas com `VITE_` são expostas pelo Vite no build. Configure `VITE_API_URL` com o endereço do backend antes do deploy em produção.

## Executar localmente

```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173` (porta padrão do Vite).

## Build para produção

```bash
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist/`.

Para testar o build localmente:

```bash
npm run preview
```

## Estrutura resumida

```
frontend/
├── public/          # Ícones PWA, favicon
├── src/
│   ├── components/  # Componentes reutilizáveis
│   ├── router/      # Rotas Vue Router
│   ├── services/    # Cliente HTTP (Axios)
│   ├── utils/       # Formatadores e helpers
│   └── views/       # Páginas da aplicação
├── .env.example
└── vite.config.js   # Configuração Vite + PWA
```

## Deploy

1. Defina `VITE_API_URL` apontando para a API em produção.
2. Execute `npm run build`.
3. Publique o conteúdo de `dist/` em um serviço de hospedagem estática (Vercel, Netlify, Cloudflare Pages, etc.).
4. Garanta que o backend permita CORS a partir do domínio do frontend.
