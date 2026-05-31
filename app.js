const STORAGE_KEY = "shopcart-ui:v1";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function usd(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
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
      name: "Pulse Bluetooth Headphones",
      desc: "Long battery life, punchy bass, and basic noise canceling.",
      price: 249.9,
      category: "Audio",
      featured: 92,
    },
    {
      id: "p2",
      name: "Neo 75 Mechanical Keyboard",
      desc: "Compact layout, tactile switches, and adjustable lighting.",
      price: 389.0,
      category: "Peripherals",
      featured: 88,
    },
    {
      id: "p3",
      name: "Pro Glide Mouse",
      desc: "Accurate sensor and ergonomic shape for long sessions.",
      price: 159.9,
      category: "Peripherals",
      featured: 84,
    },
    {
      id: "p4",
      name: "Urban Tech Backpack 20L",
      desc: "Padded compartment and cable-friendly organization.",
      price: 219.9,
      category: "Accessories",
      featured: 78,
    },
    {
      id: "p5",
      name: "AirStand Laptop Stand",
      desc: "Better posture and airflow with height adjustment.",
      price: 129.9,
      category: "Accessories",
      featured: 75,
    },
    {
      id: "p6",
      name: "Mini Wave Speaker",
      desc: "Portable sound with splash resistance and stereo pairing.",
      price: 179.9,
      category: "Audio",
      featured: 81,
    },
    {
      id: "p7",
      name: 'Studio 27" QHD Monitor',
      desc: "Consistent colors, thin bezels, and reading mode.",
      price: 1299.0,
      category: "Monitors",
      featured: 90,
    },
    {
      id: "p8",
      name: "USB-C Hub 8-in-1",
      desc: "HDMI, USB 3.0, SD, and pass-through charging.",
      price: 199.9,
      category: "Accessories",
      featured: 79,
    },
    {
      id: "p9",
      name: "Nova X Gaming Headset",
      desc: "Noise-reducing mic and spatial audio.",
      price: 329.9,
      category: "Audio",
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
  allOpt.textContent = "All";
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
    price.textContent = usd(p.price);

    const row2 = document.createElement("div");
    row2.className = "product__row";

    const btn = document.createElement("button");
    btn.className = "btn btn--primary";
    btn.type = "button";
    btn.textContent = "Add";
    btn.addEventListener("click", () => {
      addToCart(p.id, 1);
      showToast("Added to cart.");
    });

    const ghost = document.createElement("button");
    ghost.className = "btn btn--ghost";
    ghost.type = "button";
    ghost.textContent = "View cart";
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
      '<strong>Your cart is empty</strong><div class="muted">Add items to see totals.</div>';
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
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        addToCart(p.id, -qty);
        showToast("Removed from cart.");
      });

      top.appendChild(title);
      top.appendChild(remove);

      const row = document.createElement("div");
      row.className = "product__row";

      const unit = document.createElement("span");
      unit.className = "muted";
      unit.textContent = `${usd(p.price)} / unit`;

      const qtyWrap = document.createElement("div");
      qtyWrap.className = "qty";

      const minus = document.createElement("button");
      minus.className = "qty__btn";
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Decrease quantity");
      minus.addEventListener("click", () => addToCart(p.id, -1));

      const val = document.createElement("span");
      val.className = "qty__value";
      val.textContent = String(qty);

      const plus = document.createElement("button");
      plus.className = "qty__btn";
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Increase quantity");
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
      line.textContent = usd(p.price * qty);

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
  subtotalEl.textContent = usd(subtotal);
  shippingEl.textContent = usd(shipping);
  totalEl.textContent = usd(total);
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
  showToast("Filters cleared.");
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
  const ok = confirm("Are you sure you want to clear the cart?");
  if (!ok) return;
  cart = {};
  saveCart(cart);
  renderCart();
  showToast("Cart cleared.");
});

checkoutBtn.addEventListener("click", () => {
  if (cartItemCount() === 0) {
    showToast("Your cart is empty.");
    return;
  }
  showToast("Checkout: UI demo (no backend).");
});
