let allProducts = [];
let filteredProducts = [];

// LOAD DATA
async function loadData() {
  const res = await fetch("./db.json");
  allProducts = await res.json();
  filteredProducts = [...allProducts];
  renderTable();
}

// RENDER TABLE
function renderTable() {
  const tbody = document.querySelector(".table-id");

  tbody.innerHTML = filteredProducts
    .map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.title}</td>
        <td class="price-tag">$${p.price}</td>
        <td>
          <span class="badge badge-category">
            ${p.category?.name || ""}
          </span>
        </td>
        <td>
          <img src="${p.images?.[0]}" class="product-img"/>
        </td>
      </tr>
    `
    )
    .join("");
}

// SEARCH (oninput)
document.getElementById("searchInput").addEventListener("input", function () {
  const key = this.value.toLowerCase();
  filteredProducts = allProducts.filter((p) =>
    p.title.toLowerCase().includes(key)
  );
  renderTable();
});

// SORT
document.getElementById("sortSelect").addEventListener("change", function () {
  const value = this.value;

  if (value === "name-asc") {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  } else if (value === "name-desc") {
    filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
  } else if (value === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (value === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  renderTable();
});

loadData();
