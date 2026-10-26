# CheckPro 2.0

Sistema web de checklists técnicos para inspeções elétricas industriais: medições comparadas com limites
técnicos, não conformidades geradas automaticamente, acompanhamento pelo PCM, indicadores para o gestor
e relatórios em PDF e Excel.

> **Versão de demonstração.** Os dados são fictícios e ficam salvos apenas no navegador de quem usa (LocalStorage).

## Perfis
- **Eletricista:** checklist por setor e equipamento. Temperaturas são comparadas automaticamente com o limite
  técnico; itens não conformes exigem observação e permitem **foto** tirada pelo celular.
- **PCM:** lista de não conformidades com prioridade, status da tratativa e foto ampliada.
- **Gestor:** indicadores, **gráficos** (conformidade semanal, temperatura máxima × limite, não conformidades por setor)
  e edição dos limites técnicos de cada equipamento.
- **Relatório em PDF** (gestor e PCM): indicadores, gráficos e não conformidades com fotos, filtrado por período.
- **Planilha Excel** semanal dos checklists (SheetJS).

## Demonstração
- Na tela de entrada, os botões **Entrar como Gestor / PCM / Eletricista** acessam cada perfil com um clique.
- Na primeira visita, o sistema carrega **seis semanas de inspeções de exemplo** (geradas sempre iguais).
- A faixa amarela no topo tem o botão **Restaurar dados de exemplo**, que apaga o que o visitante cadastrou.
- Para usar com uma empresa real, troque `demo: true` por `false` em `src/config/companyConfig.js`.

Usuários (também aceitos no formulário): `gestor`, `pcm` e `eletricista`, todos com a senha `123456`.

## Tecnologias
React 19, Vite, React Router, JavaScript, LocalStorage, SheetJS (XLSX), gráficos em SVG próprio
(sem bibliotecas) e impressão do navegador para gerar o PDF.

## Como executar
```bash
npm install
npm run dev
```

## Publicação
Importe o repositório na Vercel. O `vercel.json` redireciona todas as rotas para o `index.html`,
para que endereços como `/gestor` funcionem ao recarregar a página.

## Estrutura
```
src/
  auth/            usuários de demonstração e contexto de login
  config/          dados da empresa e modo demonstração
  domain/          setores, equipamentos e modelos de checklist
  services/        armazenamento, dados de exemplo, cálculos dos gráficos, exportação Excel
  components/      formulário do checklist, layout e gráficos
  pages/           painéis de cada perfil e relatório
```

## Limitações conhecidas
- Os dados ficam só no aparelho: o painel do gestor vê apenas o que foi registrado no mesmo navegador.
  A próxima etapa é migrar para um banco na nuvem (Supabase) com login real.
- Fotos são reduzidas para cerca de 100 KB, mas o LocalStorage tem limite de alguns megabytes.
- As senhas de demonstração ficam no código; não use esta versão com dados reais.
