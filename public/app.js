// Frontend app for dashboard
let products = [];
let filtered = [];
let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortDir = 1; // 1 asc, -1 desc

const $tbody = document.querySelector("#productsTable tbody");
const $search = document.getElementById("search");
const $pageSize = document.getElementById("pageSize");
const $pagination = document.getElementById("pagination");
const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));
const createModal = new bootstrap.Modal(document.getElementById("createModal"));

async function loadProducts() {
  const res = await fetch("/api/products");
  products = await res.json();
  filtered = products.slice();
  applyAll();
}

function applyAll() {
  applyFilter();
  applySort();
  render();
}

function applyFilter() {
  const q = $search.value.trim().toLowerCase();
  if (!q) filtered = products.slice();
  else
    filtered = products.filter((p) =>
      (p.title || "").toLowerCase().includes(q),
    );
  currentPage = 1;
}

function applySort() {
  if (!sortField) return;
  filtered.sort((a, b) => {
    const va = a[sortField] ?? "";
    const vb = b[sortField] ?? "";
    if (typeof va === "string") return va.localeCompare(vb) * sortDir;
    return (va - vb) * sortDir;
  });
}

function render() {
  // pagination
  pageSize = parseInt($pageSize.value, 10);
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > pages) currentPage = pages;
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  $tbody.innerHTML = "";
  for (const p of pageItems) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", p.id);
    tr.setAttribute("title", p.description || ""); // show description on hover via tooltip
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${escapeHtml(p.title || "")}</td>
      <td>${p.price ?? ""}</td>
      <td>${p.category && p.category.name ? escapeHtml(p.category.name) : p.categoryId || ""}</td>
      <td>${p.images && p.images.length ? `<img src="${escapeHtml(p.images[0])}" alt="" style="width:60px; height:40px; object-fit:cover;">` : ""}</td>
    `;
    tr.addEventListener("click", () => openView(p.id));
    $tbody.appendChild(tr);
  }

  // init bootstrap tooltips for descriptions
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll("[title]"),
  );
  tooltipTriggerList.map(function (el) {
    return new bootstrap.Tooltip(el, { container: "body" });
  });

  // pagination UI
  $pagination.innerHTML = "";
  for (let i = 1; i <= pages; i++) {
    const li = document.createElement("li");
    li.className = "page-item" + (i === currentPage ? " active" : "");
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      render();
    });
    $pagination.appendChild(li);
  }
}

function escapeHtml(s) {
  return (s + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function openView(id) {
  const res = await fetch(`/api/products/${id}`);
  const p = await res.json();
  document.getElementById("viewTitle").textContent = p.title;
  const body = document.getElementById("viewBody");
  body.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>Price:</strong> ${p.price}</p>
        <p><strong>Category:</strong> ${p.category && p.category.name ? p.category.name : p.categoryId || ""}</p>
        <p><strong>Description:</strong><br>${escapeHtml(p.description || "")}</p>
      </div>
      <div class="col-md-6">
        ${p.images && p.images.length ? p.images.map((i) => `<img src="${i}" style="width:100%; margin-bottom:8px;">`).join("") : ""}
      </div>
    </div>
    <hr>
    <form id="editForm">
      <div class="mb-2"><label class="form-label">Title</label><input name="title" class="form-control" value="${escapeHtml(p.title || "")}"></div>
      <div class="mb-2"><label class="form-label">Price</label><input name="price" type="number" class="form-control" value="${p.price}"></div>
      <div class="mb-2"><label class="form-label">Description</label><textarea name="description" class="form-control">${escapeHtml(p.description || "")}</textarea></div>
      <div class="mb-2"><label class="form-label">Image URL (comma separated)</label><input name="images" class="form-control" value="${(p.images || []).join(",")}"></div>
    </form>
  `;
  // show modal
  viewModal.show();

  document.getElementById("btnEditSave").onclick = async () => {
    const form = document.getElementById("editForm");
    const fd = new FormData(form);
    const payload = {
      title: fd.get("title"),
      price: Number(fd.get("price")),
      description: fd.get("description"),
      images: fd
        .get("images")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const r = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const updated = await r.json();
    // update local copy
    const idx = products.findIndex((x) => x.id === updated.id);
    if (idx >= 0) products[idx] = { ...products[idx], ...updated };
    applyAll();
    viewModal.hide();
    alert("Cập nhật thành công");
  };
}

// Create product
document.getElementById("btnCreate").addEventListener("click", () => {
  createModal.show();
});

document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {
    title: fd.get("title"),
    price: Number(fd.get("price")),
    description: fd.get("description"),
    categoryId: Number(fd.get("categoryId")),
    images: fd
      .get("images")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  const r = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const created = await r.json();
  products.unshift(created);
  applyAll();
  createModal.hide();
  e.target.reset();
  alert("Tạo sản phẩm thành công");
});

// Search live
$search.addEventListener("input", () => {
  applyAll();
});
$pageSize.addEventListener("change", () => {
  currentPage = 1;
  render();
});

// Sorting
document.getElementById("sortTitle").addEventListener("click", () => {
  if (sortField === "title") sortDir *= -1;
  else {
    sortField = "title";
    sortDir = 1;
  }
  applyAll();
});
document.getElementById("sortPrice").addEventListener("click", () => {
  if (sortField === "price") sortDir *= -1;
  else {
    sortField = "price";
    sortDir = 1;
  }
  applyAll();
});

// Export CSV of current view
document.getElementById("btnExport").addEventListener("click", () => {
  const rows = [];
  const headers = ["id", "title", "price", "category", "images"];
  rows.push(headers.join(","));
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  for (const p of pageItems) {
    const cat =
      p.category && p.category.name ? p.category.name : p.categoryId || "";
    const imgs = (p.images || []).join("|");
    rows.push(
      [
        p.id,
        `"${(p.title || "").replace(/"/g, '""')}"`,
        p.price,
        `"${(cat + "").replace(/"/g, '""')}"`,
        `"${imgs.replace(/"/g, '""')}"`,
      ].join(","),
    );
  }
  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products_export.csv";
  a.click();
  URL.revokeObjectURL(url);
});

loadProducts();
