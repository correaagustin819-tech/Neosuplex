// admin.js - Exclusivo para el panel de proveedor
const API_URL = 'http://localhost:8080/api/productos';
let listaProductos = [];

// Cuando la página carga, traemos la lista de productos
document.addEventListener('DOMContentLoaded', cargarProductosEnTabla);

// Escuchamos el botón de guardar y el de cancelar
document.getElementById('form-producto').addEventListener('submit', guardarProducto);
document.getElementById('btn-cancelar').addEventListener('click', limpiarFormulario);

// 1. LEER TODOS LOS PRODUCTOS (GET)
async function cargarProductosEnTabla() {
    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();
        listaProductos = productos;
        const tbody = document.getElementById('tabla-productos');
        tbody.innerHTML = '';

        productos.forEach(p => {
            // Reemplazamos null por textos vacíos para evitar que diga "null" en pantalla
            let desc = p.descripcion ? p.descripcion.replace(/'/g, "\\'") : '';
            let stockActual = p.stock ? p.stock : 0;

            let fila = document.createElement('tr');
            fila.innerHTML = `
                <td><img src="${p.imagenUrl}" width="50" style="border-radius:5px; border: 1px solid #444;"></td>
                <td style="font-weight: bold;">${p.nombre}<br><span style="font-size:12px; color:#888; font-weight:normal;">${p.categoria}</span></td>
                <td>$${p.precio.toLocaleString('es-AR')}</td>
                <td>${stockActual} uds.</td>
            <td>
            <button class="btn-edit" onclick="prepararEdicion(${p.id})"><i class="fas fa-edit"></i> Editar</button>
            <button class="btn-danger" onclick="eliminarProducto(${p.id})"><i class="fas fa-trash"></i></button>
        </td>
    `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
    }
}

// 2. CREAR O EDITAR UN PRODUCTO (POST o PUT)
async function guardarProducto(evento) {
    evento.preventDefault(); // Evita que la página se recargue
    
    const id = document.getElementById('prod-id').value;
    
    // Armamos el "paquete" con la información del formulario
    const productoData = {
        nombre: document.getElementById('prod-nombre').value,
        precio: parseFloat(document.getElementById('prod-precio').value),
        categoria: document.getElementById('prod-categoria').value,
        imagenUrl: document.getElementById('prod-imagen').value,
        stock: parseInt(document.getElementById('prod-stock').value),
        descripcion: document.getElementById('prod-descripcion').value,
        destacado: true 
    };

    try {
        let url = API_URL;
        let metodoHTTP = 'POST'; // Por defecto es POST (Crear nuevo)

        if (id) {
            url = `${API_URL}/${id}`; 
            metodoHTTP = 'PUT'; // Si hay un ID escondido, cambiamos a PUT (Editar existente)
        }

        // Enviamos el paquete a Java
        await fetch(url, {
            method: metodoHTTP,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoData)
        });

        limpiarFormulario();
        cargarProductosEnTabla(); // Refrescamos la tabla
        alert(id ? "¡Producto modificado con éxito!" : "¡Nuevo producto agregado a la tienda!");

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error de conexión con el servidor.");
    }
}

// 3. ELIMINAR UN PRODUCTO (DELETE)
async function eliminarProducto(id) {
    if(confirm("¿Estás 100% seguro de que quieres eliminar este suplemento para siempre?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            cargarProductosEnTabla(); // Refrescamos la tabla
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}

// FUNCIONES AUXILIARES VISUALES
//  solo recibe el ID
function prepararEdicion(idBuscado) {
    
    // Buscamos el producto en nuestra memoria usando el ID
    const producto = listaProductos.find(p => p.id === idBuscado);
    
    // Llenamos el formulario con los datos que encontramos
    document.getElementById('prod-id').value = producto.id;
    document.getElementById('prod-nombre').value = producto.nombre;
    document.getElementById('prod-precio').value = producto.precio;
    document.getElementById('prod-categoria').value = producto.categoria;
    document.getElementById('prod-imagen').value = producto.imagenUrl;
    document.getElementById('prod-stock').value = producto.stock || 0;
    document.getElementById('prod-descripcion').value = producto.descripcion || '';
    
    // (Esta parte queda exactamente igual que antes)
    document.getElementById('btn-guardar').innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Producto';
    document.getElementById('btn-guardar').style.background = '#ffb800'; 
    document.getElementById('btn-cancelar').style.display = 'inline-block';
    
    window.scrollTo(0, 0);
}

function limpiarFormulario() {
    document.getElementById('form-producto').reset();
    document.getElementById('prod-id').value = '';
    
    // Restauramos los botones
    document.getElementById('btn-guardar').innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
    document.getElementById('btn-guardar').style.background = '#00d26a'; // Verde
    document.getElementById('btn-cancelar').style.display = 'none';
}