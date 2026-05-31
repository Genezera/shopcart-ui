const STORAGE_KEY = "shopcart-ui:v1";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function brl(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
}

function productImageDataUri(seed, label) {
  const bg1 = encodeURIComponent("#0b1220");
  const a = encodeURIComponent("#6ee7ff");
  const b = encodeURIComponent("#a78bfa");
  const text = encodeURIComponent(label);
  const s = encodeURIComponent(String(seed));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="900" height="520" rx="36" fill="${bg1}"/><circle cx="720" cy="140" r="120" fill="url(#g)" opacity="0.25"/><circle cx="160" cy="360" r="160" fill="url(#g)" opacity="0.18"/><text x="56" y="92" fill="url(#g)" font-family="ui-sans-serif,system-ui" font-size="26" font-weight="700">ShopCart</text><text x="56" y="150" fill="#e6edf7" font-family="ui-sans-serif,system-ui" font-size="42" font-weight="900">${text}</text><text x="56" y="196" fill="#9fb0c6" font-family="ui-sans-serif,system-ui" font-size="18">SKU ${s}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildProducts() {
  return [
    {
      id: "p1",
      name: "Fone Bluetooth Pulse",
      desc: "Bateria longa, graves fortes e cancelamento de ruído básico.",
      price: 249.9,
      category: "Áudio",
      featured: 92,
    },
    {
      id: "p2",
      name: "Teclado Mecânico Neo 75",
      desc: "Layout compacto, switches táteis e iluminação ajustável.",
      price: 389.0,
      category: "Periféricos",
      featured: 88,
    },
    {
      id: "p3",
      name: "Mouse Pro Glide",
      desc: "Sensor preciso e ergonomia para longas sessões.",
      price: 159.9,
      category: "Periféricos",
      featured: 84,
    },
    {
      id: "p4",
      name: "Mochila Urban Tech 20L",
      desc: "Compartimento acolchoado e organização para cabos.",
      price: 219.9,
      category: "Acessórios",
      featured: 78,
    },
    {
      id: "p5",
      name: "Suporte de Notebook AirStand",
      desc: "Melhora postura e ventilação, com ajuste de altura.",
      price: 129.9,
      category: "Acessórios",
      featured: 75,
    },
    {
      id: "p6",
      name: "Caixa de Som Mini Wave",
      desc: "Som portátil com resistência a respingos e modo estéreo.",
      price: 179.9,
      category: "Áudio",
      featured: 81,
    },
    {
      id: "p7",
      name: "Monitor 27\" QHD Studio",
      desc: "Cores consistentes, bordas finas e modo leitura.",
      price: 1299.0,
      category: "Monitores",
      featured: 90,
    },
    {
      id: "p8",
      name: "Hub USB-C 8 em 1",
      desc: "HDMI, USB 3.0, SD e carregamento pass-through.",
      price: 199.9,
      category: "Acessórios",
      featured: 79,
    },
    {
      id: "p9",
      name: "Headset Gamer Nova X",
      desc: "Microfone com redução de ruído e áudio espacial.",
      price: 329.9,
      category: "Áudio",
      featured: 83,
    },
  ].map((p, idx) => ({
    ...p,
    image: productImageDataUri(idx + 1, p.name.split(" ").slice(0, 2).join(" ")),
  }));
}

function loadCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeJsonParse(raw, null) : null;
  if (!parsed || typeof parsed !== "object") return {};
  if (!parsed.cart || typeof parsed.cart !== "object") return {};
  return parsed.cart;
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart }));
}

const $ = (sel, root = document) => root.querySelector(sel);

const productsEl = $("[data-products]");
const resultCountEl = $("[data-result-count]");
const searchEl = $("[data-search]");
const categoryEl = $("[data-category]");
const sortEl = $("[data-sort]");
const clearFiltersBtn = $("[data-clear-filters]");

const drawerEl = $("[data-drawer]");
const openCartBtn = $("[data-open-cart]");
const closeCartBtn = $("[data-close-cart]");
const cartItemsEl = $("[data-cart-items]");
const cartCountEl = $("[data-cart-count]");
const subtotalEl = $("[data-subtotal]");
const shippingEl = $("[data-shipping]");
const totalEl = $("[data-total]");
const clearCartBtn = $("[data-clear-cart]");
const checkoutBtn = $("[data-checkout]");

const toastEl = $("[data-toast]");
let toastTimer = null;

const products = buildProducts();
let cart = loadCart();

const filters = {
  q: "",
  category: "all",
  sort: "featured",
};

function showToast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2200);
}

function cartItemCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartSubtotal() {
  let sum = 0;
  for (const p of products) {
    const qty = cart[p.id] || 0;
    if (qty > 0) sum += p.price * qty;
  }
  return sum;
}

function shippingCost(subtotal) {
  if (subtotal <= 0) return 0;
  if (subtotal >= 399) return 0;
  return 24.9;
}

function setDrawerOpen(open) {
  if (!drawerEl) return;
  drawerEl.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
  if (open) closeCartBtn?.focus();
}

function renderCategoryOptions() {
  const categories = Array.from(new Set(products.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b),
  );
  categoryEl.replaceChildren();
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "Todas";
  categoryEl.appendChild(allOpt);
  for (const c of categories) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryEl.appendChild(opt);
  }
  categoryEl.value = filters.category;
}

function applyFilters(list) {
  let out = list.slice();
  const q = filters.q.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }
  if (filters.category !== "all") {
    out = out.filter((p) => p.category === filters.category);
  }

  const sort = filters.sort;
  out.sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    return (b.featured || 0) - (a.featured || 0);
  });

  return out;
}

function addToCart(productId, amount = 1) {
  const current = cart[productId] || 0;
  const next = Math.max(0, current + amount);
  if (next === 0) delete cart[productId];
  else cart[productId] = next;
  saveCart(cart);
  renderCart();
}

function renderProducts() {
  const visible = applyFilters(products);
  resultCountEl.textContent = String(visible.length);
  productsEl.replaceChildren();

  for (const p of visible) {
    const card = document.createElement("article");
    card.className = "product";

    const img = document.createElement("img");
    img.className = "product__img";
    img.src = p.image;
    img.alt = p.name;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "product__body";

    const title = document.createElement("h3");
    title.className = "product__title";
    title.textContent = p.name;

    const desc = document.createElement("p");
    desc.className = "product__desc";
    desc.textContent = p.desc;

    const row = document.createElement("div");
    row.className = "product__row";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = p.category;

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = brl(p.price);

    const row2 = document.createElement("div");
    row2.className = "product__row";

    const btn = document.createElement("button");
    btn.className = "btn btn--primary";
    btn.type = "button";
    btn.textContent = "Adicionar";
    btn.addEventListener("click", () => {
      addToCart(p.id, 1);
      showToast("Adicionado ao carrinho.");
    });

    const ghost = document.createElement("button");
    ghost.className = "btn btn--ghost";
    ghost.type = "button";
    ghost.textContent = "Ver carrinho";
    ghost.addEventListener("click", () => setDrawerOpen(true));

    row.appendChild(badge);
    row.appendChild(price);

    row2.appendChild(btn);
    row2.appendChild(ghost);

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(row);
    body.appendChild(row2);

    card.appendChild(img);
    card.appendChild(body);

    productsEl.appendChild(card);
  }
}

function renderCart() {
  const count = cartItemCount();
  cartCountEl.textContent = String(count);

  cartItemsEl.replaceChildren();

  const entries = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter((x) => x.product && x.qty > 0);

  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "cart-item";
    empty.innerHTML =
      '<strong>Carrinho vazio</strong><div class="muted">Adicione alguns itens para ver o resumo.</div>';
    cartItemsEl.appendChild(empty);
  } else {
    for (const { product: p, qty } of entries) {
      const item = document.createElement("div");
      item.className = "cart-item";

      const top = document.createElement("div");
      top.className = "cart-item__top";

      const title = document.createElement("h3");
      title.className = "cart-item__title";
      title.textContent = p.name;

      const remove = document.createElement("button");
      remove.className = "icon-btn danger";
      remove.type = "button";
      remove.textContent = "Remover";
      remove.addEventListener("click", () => {
        addToCart(p.id, -qty);
        showToast("Removido do carrinho.");
      });

      top.appendChild(title);
      top.appendChild(remove);

      const row = document.createElement("div");
      row.className = "product__row";

      const unit = document.createElement("span");
      unit.className = "muted";
      unit.textContent = `${brl(p.price)} / un.`;

      const qtyWrap = document.createElement("div");
      qtyWrap.className = "qty";

      const minus = document.createElement("button");
      minus.className = "qty__btn";
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Diminuir quantidade");
      minus.addEventListener("click", () => addToCart(p.id, -1));

      const val = document.createElement("span");
      val.className = "qty__value";
      val.textContent = String(qty);

      const plus = document.createElement("button");
      plus.className = "qty__btn";
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Aumentar quantidade");
      plus.addEventListener("click", () => addToCart(p.id, 1));

      qtyWrap.appendChild(minus);
      qtyWrap.appendChild(val);
      qtyWrap.appendChild(plus);

      row.appendChild(unit);
      row.appendChild(qtyWrap);

      const row2 = document.createElement("div");
      row2.className = "product__row";

      const cat = document.createElement("span");
      cat.className = "badge";
      cat.textContent = p.category;

      const line = document.createElement("strong");
      line.textContent = brl(p.price * qty);

      row2.appendChild(cat);
      row2.appendChild(line);

      item.appendChild(top);
      item.appendChild(row);
      item.appendChild(row2);

      cartItemsEl.appendChild(item);
    }
  }

  const subtotal = cartSubtotal();
  const shipping = shippingCost(subtotal);
  const total = subtotal + shipping;
  subtotalEl.textContent = brl(subtotal);
  shippingEl.textContent = brl(shipping);
  totalEl.textContent = brl(total);
}

renderCategoryOptions();
renderProducts();
renderCart();

searchEl.addEventListener("input", () => {
  filters.q = searchEl.value;
  renderProducts();
});

categoryEl.addEventListener("change", () => {
  filters.category = categoryEl.value;
  renderProducts();
});

sortEl.addEventListener("change", () => {
  filters.sort = sortEl.value;
  renderProducts();
});

clearFiltersBtn.addEventListener("click", () => {
  filters.q = "";
  filters.category = "all";
  filters.sort = "featured";
  searchEl.value = "";
  categoryEl.value = "all";
  sortEl.value = "featured";
  renderProducts();
  showToast("Filtros limpos.");
});

openCartBtn.addEventListener("click", () => setDrawerOpen(true));
closeCartBtn.addEventListener("click", () => setDrawerOpen(false));

drawerEl.addEventListener("click", (ev) => {
  if (ev.target === drawerEl) setDrawerOpen(false);
});

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") setDrawerOpen(false);
});

clearCartBtn.addEventListener("click", () => {
  const ok = confirm("Tem certeza que deseja limpar o carrinho?");
  if (!ok) return;
  cart = {};
  saveCart(cart);
  renderCart();
  showToast("Carrinho limpo.");
});

checkoutBtn.addEventListener("click", () => {
  if (cartItemCount() === 0) {
    showToast("Seu carrinho está vazio.");
    return;
  }
  showToast("Checkout: UI demo (sem backend).");
});

