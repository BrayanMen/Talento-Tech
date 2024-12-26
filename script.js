let currentPage = 1;
const itemsPerPage = 6;
let navbar = document.querySelector('.header_section');
let carroDeCompra = [];
let openModal = false

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
          <button class="btn-primary btn-secondary view-details" data-id="${moto.id}">
            Ver Detalles
          </button>
          <button class="btn-primary  add-to-cart" data-id="${moto.id}">
                    <i class="fas fa-shopping-cart"></i>
           </button>
        </div>`;
        contenedorItem.innerHTML += itemCard;
    });

    contenedorItem.querySelectorAll('.view-details').forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            const data = await cargaDatos("./data/data.json");
            const moto = data.cafe_racers.find(m => m.id === parseInt(id));
            mostrarModal(moto);
        };
    });

    contenedorItem.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            const data = await cargaDatos("./data/data.json");
            const moto = data.cafe_racers.find(m => m.id === parseInt(id));
            agregarAlCarro(moto);
        };
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
    const items = await cargaDatos('./data/reviews.json');
    const itemsDestacados = items.reviews;
    cargarOpiniones(itemsDestacados);
}

async function mostrarTodosLosItems() {
    const items = await cargaDatos("./data/data.json");
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

function agregarAlCarro(item) { 
    const existente = carroDeCompra.find(prod => prod.id === item.id);
    if (existente) {
        existente.cantidad++;
    } else {
        item.cantidad = 1;
        carroDeCompra.push(item);
    }    
    actuContadorCart();  
    actuCarrito();
    guardarCarritoLocalStorage();
}

function eliminarDelCarrito(id) {    
        carroDeCompra = carroDeCompra.filter(item => item.id !== id);
        actuCarrito();
        actuContadorCart(); 
        guardarCarritoLocalStorage(); 
}

function aumentarCantidad(id) {
    const item = carroDeCompra.find(prod => prod.id === id);
    if (item) {
        item.cantidad++;
        actuCarrito();
        actuContadorCart(); 
        guardarCarritoLocalStorage();
    }
}

function disminuirCantidad(id) {
    const item = carroDeCompra.find(prod => prod.id === id);
    if (item) {
        if (item.cantidad > 1) {
            item.cantidad--;
        } else if (item.cantidad === 0) {
            eliminarDelCarrito(id);
        }
        actuCarrito();
        actuContadorCart(); 
        guardarCarritoLocalStorage();
    }
}

function guardarCarritoLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carroDeCompra));
}

function cargarCarritoDeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carroDeCompra = JSON.parse(carritoGuardado);
        actuCarrito();
        actuContadorCart();
    }
}

function actuContadorCart() {
    const contador = document.querySelector('.cart-count');
    contador.textContent = carroDeCompra.length;

    if (carroDeCompra.length > 0) {
        // contador.classList.add('active');
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.width = '100%';
        navbar.style.zIndex = '1000';
        navbar .style.backgroundColor = 'black';
        document.body.style.paddingTop = navbar.offsetHeight + 'px';
    } else {
        // contador.classList.remove('active');
        navbar.style.position = 'static';
        document.body.style.paddingTop = '0';
    }
}

function actuCarrito() {
    const contenedorCart = document.querySelector('.cart-items');
    if (!contenedorCart) return;
    contenedorCart.innerHTML = '';

    let total = 0;

    carroDeCompra.forEach((item, index) => {
        total += item.precio * item.cantidad;
        const itemCart = `
        <div class="cart-item">
            <img src="${item.imagen}" alt="${item.modelo}">
            <div class="cart-item-info">
                <h3>${item.modelo}</h3>
                <p>Precio: $${item.precio}</p>
                <p><strong>Cantidad: ${item.cantidad}</strong></p>
            </div>
            <div class="cart-item-buttons">
                <button class="btn-quantity btn-decrease" data-id="${item.id}">-</button>
                <button class="btn-quantity btn-increase" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item"  data-id="${item.id}" ">
               <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>`;
        contenedorCart.innerHTML += itemCart;
    });

    document.querySelector('.cart-total').textContent = `$${total}`;

    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', () => aumentarCantidad(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', () => disminuirCantidad(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => eliminarDelCarrito(parseInt(btn.dataset.id)));
    });
}

function mostrarModal(moto) {
    if (openModal) return;
    openModal = true;

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">✕</span>
        <div class="modal-body">
          <img src="${moto.imagen}" alt="${moto.modelo}">
          <div class="modal-info">
            <h2>${moto.modelo}</h2>
            <p>${moto.motor}</p>
            <p>${moto.año}</p>
            <p><strong>Precio: $${moto.precio}</strong></p>
            <p>${moto.descripcion || 'Descripción no disponible'}</p>
            <button class="btn-primary add-to-cart" data-id="${moto.id}">
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);

    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
        openModal = false;
    });

    modal.querySelector('.add-to-cart').addEventListener('click', () => {
        agregarAlCarro(moto);
        modal.remove();
        openModal = false;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const ruta = window.location.pathname;
    cargarCarritoDeLocalStorage();
    if (ruta.includes("index.html") || ruta === "/") {
        mostrarItemsDestacados();   
        mostrarReviewsDestacados();
    }
    if (ruta.includes("/models.html")) {
        mostrarTodosLosItems();

    }
    if (ruta.includes("/reviews.html")) {
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