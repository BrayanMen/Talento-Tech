let currentPage = 1;
const itemsPerPage = 6;

async function cargaDatos(ruta) {
    try {
        const response = await fetch(ruta);
        if (!response.ok) throw new Error("Error al cargar datos del Json");
        const data = await response.json();
        return data;
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

function cargarOpiniones(items) {
     const contenedor = document.querySelector('.reviews-grid');
      items.forEach(review => {
        const reviewCard = `
          <div class="review-card">
            <div class="review-info">
              <img class="review-avatar" src="${review.avatar}" alt="${review.nombre}">
              <div class="review-details">
                <h3 class="review-title">"${review.titulo}"</h3>
                <div class="review-user">
                  <cite class="user-name">${review.nombre}</cite>
                  <time datetime="${review.fecha}" class="review-date">${review.fecha}</time>
                </div>
                <div class="review-rating">
                  ${'★'.repeat(review.calificacion)}${'☆'.repeat(5 - review.calificacion)}
                </div>
              </div>
            </div>
            <p class="review-text">${review.comentario}</p>
          </div>`;
        contenedor.innerHTML += reviewCard;
      });
  }

async function mostrarItemsDestacados() {
    const items = await cargaDatos("./data/data.json");
    const itemsDestacados = items.cafe_racers.slice(20, 23);
    renderizarItems(itemsDestacados, ".featured-models");
}

async function mostrarReviewsDestacados() {
    const items = await cargaDatos('./data/reviews.json');
    const itemsDestacados = items.reviews.slice(0, 3);
    cargarOpiniones(itemsDestacados);
}

async function mostrarTodosLosReviews() {
    const items = await cargaDatos('../data/reviews.json');
    const itemsDestacados = items.reviews;    
    cargarOpiniones(itemsDestacados);
}

async function mostrarTodosLosItems() {
    const items = await cargaDatos("../data/data.json");
    cargarMasModelos(items.cafe_racers);
    window.addEventListener('scroll', () => manejarScroll(items.cafe_racers));
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
        mostrarReviewsDestacados();
    }
    if (ruta.includes("/pages/models.html")) {
        mostrarTodosLosItems();
    }
    if (ruta.includes("/pages/reviews.html")) {
        mostrarTodosLosReviews();
    }
});

document.getElementById('cart-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.cart-container').classList.add('active');
});

document.getElementById('close-cart').addEventListener('click', () => {
    document.querySelector('.cart-container').classList.remove('active');
});