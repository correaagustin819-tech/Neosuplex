package com.neosuplex.neosuplexapi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // 1. OBTENER TODOS LOS PRODUCTOS (El que ya teníamos)
    @GetMapping
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    // 2. AGREGAR UN NUEVO PRODUCTO
    @PostMapping
    public Producto crearProducto(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }

    // 3. EDITAR UN PRODUCTO EXISTENTE
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Integer id, @RequestBody Producto productoDetalles) {
        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setNombre(productoDetalles.getNombre());
                    producto.setPrecio(productoDetalles.getPrecio());
                    producto.setCategoria(productoDetalles.getCategoria());
                    producto.setImagenUrl(productoDetalles.getImagenUrl());
                    producto.setStock(productoDetalles.getStock());
                    producto.setDescripcion(productoDetalles.getDescripcion());
                    producto.setDestacado(productoDetalles.getDestacado());
                    return ResponseEntity.ok(productoRepository.save(producto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. ELIMINAR UN PRODUCTO
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminarProducto(@PathVariable Integer id) {
        return productoRepository.findById(id)
                .map(producto -> {
                    productoRepository.delete(producto);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}