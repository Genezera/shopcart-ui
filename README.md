# ShopCart UI

Catálogo de produtos com filtros/pesquisa, carrinho lateral (drawer) e persistência em LocalStorage. Projeto pensado para portfólio (UI, estado, UX, responsividade).

## Features

- Catálogo com pesquisa, filtro por categoria e ordenação
- Carrinho em drawer (quantidade + remover + limpar)
- Resumo de valores (subtotal, frete simulado e total)
- Persistência do carrinho em LocalStorage
- Dados mockados (sem backend) com imagens em SVG (data URI)

## Tecnologias

- HTML + CSS
- JavaScript (sem bibliotecas)
- LocalStorage

## Como rodar

- Abra `index.html` no navegador  
  ou
- Rode um servidor local na pasta do projeto:

```bash
python -m http.server 5173
```

Abra: `http://localhost:5173/`

## O que esse projeto demonstra

- Estado de UI e renderização dinâmica
- Componentização simples via funções
- Boas práticas de UX (drawer, feedbacks, empty state)
