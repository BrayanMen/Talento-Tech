let currentPage = 1;
const itemsPerPage = 6;

async function cargaDatos() {
    try {
        const response = await fetch("./data/data.json");
        if (!response.ok) throw new Error("Error al cargar datos del Json");
        const data = await response.json();
        return data.cafe_racers;
    } catch (error) {
        console.log("Error: ", error.message);
        return [];
    }
}

async function cargaDatos2() {
    try {
        const response = await fetch("../data/data.json");
        if (!response.ok) throw new Error("Error al cargar datos del Json");
        const data = await response.json();
        return data.cafe_racers;
    } catch (error) {
        console.log("Error: ", error.message);
        return [];
    }
}

function renderizarItems(items, contenedor) {
    const contenedorItem = document.querySelector(contenedor);
    items.forEach((moto) => {
        const itemCard = `
        <div class="model-card">
          <img src="${moto.imagen}" alt="${moto.modelo}">
          <h3>${moto.modelo}</h3>
          <p>${moto.motor}</p>
          <p><strong>Precio: $${moto.precio}</strong></p>
          <button class="btn-primary btn-secondary" data-id="${moto.id}">
            Ver Detalles
          </button>
        </div>`;
        contenedorItem.innerHTML += itemCard;
    });
}

async function mostrarItemsDestacados() {
    const items = await cargaDatos();
    const itemsDestacados = items.slice(20, 23);
    renderizarItems(itemsDestacados, ".featured-models");
}

async function mostrarTodosLosItems() {
    const items = await cargaDatos2();
    console.log(items)
    cargarMasModelos(items);
    window.addEventListener('scroll', () => manejarScroll(items));
}

function cargarMasModelos(models) {
    const inicio = (currentPage - 1) * itemsPerPage;
    const fin = inicio + itemsPerPage;
    const itemsMostrar = models.slice(inicio, fin);
    
    if (itemsMostrar.length > 0) {
        renderizarItems(itemsMostrar, ".featured-models");
        currentPage++;
    }
}

function manejarScroll(models) {
    const scrollPosicion = window.innerHeight + window.scrollY;
    const scrollAltura = document.body.offsetHeight;
    
    if (scrollPosicion >= scrollAltura - 100) {
        cargarMasModelos(models);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ruta = window.location.pathname;
    if (ruta.includes("index.html") || ruta === "/") {
        mostrarItemsDestacados();
    }
    if (ruta.includes("/pages/models.html")) {
        mostrarTodosLosItems();
    }
});

document.getElementById('cart-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.cart-container').classList.add('active');
});

document.getElementById('close-cart').addEventListener('click', () => {
    document.querySelector('.cart-container').classList.remove('active');
});