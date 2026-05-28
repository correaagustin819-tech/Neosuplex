// ==========================================
// VARIABLES GLOBALES Y ESTADO
// ==========================================
let carrito = JSON.parse(localStorage.getItem("miCarrito")) || [];
let listaCompletaProductos = []; 
let listaFiltrada = []; 
let paginaActual = 1;
const productosPorPagina = 8; 
const API_BASE_URL = "http://localhost:8080/api";

// ==========================================
// INICIO AUTOMÁTICO (EVENT LISTENERS)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    actualizarContador();
    // Solo mostramos el carrito si estamos en la página del carrito
    if (document.getElementById("lista-carrito")) {
        mostrarCarrito();
    }
    obtenerProductosDesdeBackend();
    verificarSesionUsuario();
    
    // Doble chequeo para prevenir retrasos de renderizado
    setTimeout(verificarSesionUsuario, 100); 
});

// ==========================================
// LÓGICA DEL CARRITO
// ==========================================
function agregarAlCarrito(nombreProducto, precioProducto, imagenProducto) {
    let nuevoProducto = { 
        nombre: nombreProducto, 
        precio: precioProducto, 
        imagen: imagenProducto 
    };
    carrito.push(nuevoProducto);
    localStorage.setItem("miCarrito", JSON.stringify(carrito));
    actualizarContador();
    alert(`¡${nombreProducto} se agregó al carrito!`);
}

function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    localStorage.setItem("miCarrito", JSON.stringify(carrito));
    actualizarContador();
    mostrarCarrito();
}

function actualizarContador() {
    let contadores = document.getElementsByClassName("cart-count");
    for (let i = 0; i < contadores.length; i++) {
        contadores[i].innerText = carrito.length;
    }
}

function mostrarCarrito() {
    let contenedorCarrito = document.getElementById("lista-carrito");
    let contenedorTotal = document.getElementById("total-pagar");
    let btnFinalizar = document.getElementById("btn-finalizar"); 

    if (!contenedorCarrito) return; 

    contenedorCarrito.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = "<p style='padding:20px; text-align:center; color: var(--color-text-dull);'>Tu carrito está vacío.</p>";
        if (contenedorTotal) contenedorTotal.innerText = "$0.00";
        return;
    }

    carrito.forEach((item, i) => {
        total += item.precio;
        contenedorCarrito.innerHTML += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='imagenes/default.png'">
                <div style="flex-grow: 1;">
                    <h4>${item.nombre}</h4>
                </div>
                <p class="cart-price">$${item.precio.toLocaleString('es-AR')}</p>
                <button onclick="eliminarDelCarrito(${i})" class="btn-remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });

    if (contenedorTotal) contenedorTotal.innerText = "$" + total.toLocaleString('es-AR');
    if (btnFinalizar) btnFinalizar.innerHTML = `<i class="fas fa-lock"></i> Finalizar Compra ($${total.toLocaleString('es-AR')})`;
}

// ==========================================
// CONEXIÓN CON API Y RENDER DE PRODUCTOS
// ==========================================
async function obtenerProductosDesdeBackend() {
    let gridProductos = document.querySelector('.product-grid');
    if (!gridProductos) return; 

    try {
        const respuesta = await fetch(`${API_BASE_URL}/productos`);
        listaCompletaProductos = await respuesta.json();
        listaFiltrada = [...listaCompletaProductos];
        
        let controlesPaginacion = document.getElementById('controles-paginacion');
        
        if (!controlesPaginacion) {
            // Lógica para el Home (Index)
            let destacados = listaCompletaProductos
                .filter(p => p.destacado === true)
                .slice(0, 4);
            dibujarTarjetas(destacados, gridProductos);
        } else {
            // Lógica para Productos (Catálogo)
            mostrarPagina(1); 
        }

        inicializarBuscador();
        inicializarFiltros();
        inicializarOrdenamiento();

    } catch (error) {
        console.error("Error al conectar con el Backend:", error);
        gridProductos.innerHTML = "<p style='text-align:center; width:100%; color:red;'>Error al cargar el catálogo.</p>";
    }
}

function dibujarTarjetas(arrayProductos, contenedor) {
    contenedor.innerHTML = '';
    arrayProductos.forEach(producto => {
        let precioFormateado = producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 });
        
        contenedor.innerHTML += `
            <div class="product-card">
                <span class="product-category">${producto.categoria}</span>
                <img src="${producto.imagenUrl}" alt="${producto.nombre}" class="product-image" 
                     onerror="this.src='imagenes/default.png'"
                     onclick="abrirModalPorId(${producto.id})"> 
                <div class="product-info">
                    <h3 class="product-name" onclick="abrirModalPorId(${producto.id})"> ${producto.nombre}</h3>
                    <div class="product-footer">
                        <span class="product-price">$${precioFormateado}</span>
                        <button class="btn-add-cart" onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio}, '${producto.imagenUrl}')">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ==========================================
// PAGINACIÓN, BUSCADOR Y FILTROS
// ==========================================
function mostrarPagina(numeroPagina) {
    paginaActual = numeroPagina;
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = listaFiltrada.slice(inicio, fin);

    let gridProductos = document.querySelector('.product-grid');
    if (gridProductos) dibujarTarjetas(productosPagina, gridProductos);
    actualizarBotonesPaginacion();
}

function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(listaFiltrada.length / productosPorPagina);
    const nuevaPagina = paginaActual + direccion;
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        mostrarPagina(nuevaPagina);
        window.scrollTo({ top: 150, behavior: 'smooth' }); 
    }
}

function actualizarBotonesPaginacion() {
    const totalPaginas = Math.ceil(listaFiltrada.length / productosPorPagina);
    let infoPagina = document.getElementById('info-pagina');
    let btnAnterior = document.getElementById('btn-anterior');
    let btnSiguiente = document.getElementById('btn-siguiente');

    if (infoPagina) infoPagina.innerText = `Página ${paginaActual} de ${totalPaginas || 1}`;
    if (btnAnterior) btnAnterior.disabled = (paginaActual === 1);
    if (btnSiguiente) btnSiguiente.disabled = (paginaActual === totalPaginas || totalPaginas === 0);
}

function inicializarBuscador() {
    let inputBuscador = document.getElementById('buscador-productos');
    if (!inputBuscador) return;
    inputBuscador.oninput = function() {
        let textoBusqueda = this.value.toLowerCase().trim();
        listaFiltrada = listaCompletaProductos.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
        mostrarPagina(1);
    };
}

function inicializarFiltros() {
    let botonesFiltro = document.querySelectorAll('.categories-pills .pill');
    botonesFiltro.forEach(boton => {
        boton.onclick = function() {
            botonesFiltro.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            let seleccionada = this.innerText.trim().toLowerCase();
            listaFiltrada = seleccionada === 'todos' ? [...listaCompletaProductos] : 
                listaCompletaProductos.filter(p => p.categoria.toLowerCase().includes(seleccionada));
            mostrarPagina(1);
        };
    });
}

function inicializarOrdenamiento() {
    let select = document.getElementById('ordenar-productos');
    if (!select) return;
    select.onchange = function() {
        if (this.value === 'menor-mayor') listaFiltrada.sort((a, b) => a.precio - b.precio);
        else if (this.value === 'mayor-menor') listaFiltrada.sort((a, b) => b.precio - a.precio);
        mostrarPagina(1);
    };
}

// ==========================================
// PROCESO DE ENVÍO E IMPACTO EN BASE DE DATOS
// ==========================================
async function procesarPasoEnvio() {
    const sesion = localStorage.getItem("usuarioLogueado");
    if (!sesion) {
        alert("Debes iniciar sesión para registrar tu envío.");
        window.location.href = "login.html";
        return;
    }

    const usuario = JSON.parse(sesion);
    const idUsuario = usuario.id || usuario.usuarioId;

    if (!idUsuario) {
        alert("Error de sesión: ID no encontrado. Por favor, reingresa al sistema.");
        return;
    }

    const datosForm = {
        usuarioId: idUsuario,
        calle: document.getElementById("envio-calle").value.trim(),
        altura: document.getElementById("envio-altura").value.trim(),
        pisoDepto: document.getElementById("envio-piso").value.trim() || "",
        localidad: document.getElementById("envio-localidad").value.trim(),
        provincia: document.getElementById("envio-provincia").value.trim(),
        codigoPostal: document.getElementById("envio-cp").value.trim()
    };

    if (!datosForm.calle || !datosForm.altura || !datosForm.codigoPostal) {
        alert("Por favor, completa los campos obligatorios del envío.");
        return;
    }

    try {
        const respuesta = await fetch(`${API_BASE_URL}/direcciones/guardar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosForm)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            console.log("Dirección guardada exitosamente en MySQL");
            irPaso2(); 
        } else {
            alert("Error: " + resultado.mensaje);
        }
    } catch (error) {
        alert("No se pudo conectar con el servidor para guardar la dirección.");
    }
}

function irPaso2() {
    document.getElementById('paso-1').style.display = 'none';
    document.getElementById('paso-2').style.display = 'block';
    window.scrollTo(0, 0);
}

function irPaso3() {
    document.getElementById('paso-2').style.display = 'none';
    document.getElementById('paso-3').style.display = 'block';
    window.scrollTo(0, 0);
}

// Esta es la que necesitas para que funcionen los botones de Tarjeta/Mercado Pago
function toggleMetodoPago(metodo) {
    const formTarjeta = document.getElementById('form-tarjeta-detalle');
    const mensajeMP = document.getElementById('mensaje-mp');

    if (metodo === 'tarjeta') {
        formTarjeta.style.display = 'block';
        mensajeMP.style.display = 'none';
    } else {
        formTarjeta.style.display = 'none';
        mensajeMP.style.display = 'block';
    }
}

function finalizarCompra() {
    alert("¡Compra exitosa! Se ha enviado tu factura al correo electrónico registrado.");
    localStorage.removeItem('miCarrito');
    window.location.href = 'index.html';
}

// ==========================================
// GESTIÓN DE SESIÓN
// ==========================================
function verificarSesionUsuario() {
    const contenedor = document.getElementById('contenedor-usuario');
    if (!contenedor) return; 

    const datosSesion = localStorage.getItem('usuarioLogueado');
    if (datosSesion) {
        const usuario = JSON.parse(datosSesion);
        contenedor.innerHTML = `
            <div class="user-logged-info" style="display: flex; align-items: center; gap: 10px;">
                <span style="color: white; font-size: 14px; font-weight: 600;">
                    <i class="fas fa-user-circle" style="color: var(--color-primary);"></i> Hola, ${usuario.nombre}!
                </span>
                <button onclick="cerrarSesionReal()" class="btn-logout" style="border: 1px solid #ff4444; color: #ff4444; background: none; cursor:pointer; padding: 2px 8px; border-radius: 4px;">Salir</button>
            </div>
        `;
    }
}

function cerrarSesionReal() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('esProveedor'); 
    window.location.href = "index.html"; 
}

// ==========================================
// MODAL DE PRODUCTO Y CHAT
// ==========================================
function abrirModalPorId(idBuscado) {
    const producto = listaCompletaProductos.find(p => p.id === idBuscado);
    if (!producto) return;

    document.getElementById('modal-nombre').innerText = producto.nombre;
    document.getElementById('modal-precio').innerText = '$' + producto.precio.toLocaleString('es-AR');
    document.getElementById('modal-img').src = producto.imagenUrl;
    document.getElementById('modal-categoria').innerText = producto.categoria;
    document.getElementById('modal-desc').innerText = producto.descripcion || 'Sin descripción.';

    const stockStatus = document.getElementById('modal-stock-status');
    const btnAdd = document.getElementById('modal-btn-add');

    if (producto.stock > 0) {
        stockStatus.innerHTML = `<i class="fas fa-check-circle"></i> En Stock`;
        stockStatus.className = 'modal-stock-status stock-in';
        btnAdd.disabled = false;
        btnAdd.onclick = () => { agregarAlCarrito(producto.nombre, producto.precio, producto.imagenUrl); cerrarModal(); };
    } else {
        stockStatus.innerHTML = `<i class="fas fa-times-circle"></i> Agotado`;
        stockStatus.className = 'modal-stock-status stock-out';
        btnAdd.disabled = true;
    }
    document.getElementById('modal-producto').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-producto').style.display = 'none';
}

function toggleChat() {
    const chat = document.getElementById('chat-window');
    chat.style.display = (chat.style.display === 'none' || chat.style.display === '') ? 'flex' : 'none';
}
