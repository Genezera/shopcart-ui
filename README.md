# ShopCart UI

Product catalog with search/filters, a cart drawer, and LocalStorage persistence. Built as a portfolio project (UI, state, UX, responsiveness).

## Live demo

- GitHub Pages: `https://genezera.github.io/shopcart-ui/`

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

## Project structure

- `index.html` – layout and drawer markup
- `styles.css` – styling
- `app.js` – data, filters/sorting, cart state, storage, and drawer focus trap

## What this project demonstrates

- UI state and dynamic rendering
- Simple “componentization” via functions
- UX best practices (drawer, feedback, empty states)

## Interview talking points

- How filtering/sorting is implemented and kept predictable
- Cart state model + persistence strategy
- Accessibility/UX: focus handling in the drawer, Escape/backdrop close, empty states

## License

MIT
