# ShopCart UI

Product catalog with search/filters, a cart drawer, and LocalStorage persistence. Built as a portfolio project (UI, state, UX, responsiveness).

## Features

- Catalog with search, category filter, and sorting
- Cart drawer (quantity, remove, clear)
- Totals summary (subtotal, simulated shipping, total)
- Cart persistence via LocalStorage
- Mock data (no backend) with SVG images (data URI)

## Tech

- HTML + CSS
- JavaScript (no libraries)
- LocalStorage

## Run

- Open `index.html` in your browser  
  or
- Run a local server in the project folder:

```bash
python -m http.server 5173
```

Open: `http://localhost:5173/`

## What this project demonstrates

- UI state and dynamic rendering
- Simple “componentization” via functions
- UX best practices (drawer, feedback, empty states)
