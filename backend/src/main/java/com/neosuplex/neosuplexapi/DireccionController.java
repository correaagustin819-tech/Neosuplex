package com.neosuplex.neosuplexapi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/direcciones")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") // 👈 Agregá esto
public class DireccionController {

    @Autowired
    private DireccionRepository direccionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/guardar")
    public ResponseEntity<?> guardarDireccion(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("Intentando guardar dirección para el payload: " + payload);

            // Verificamos que el ID venga en el mensaje
            if (payload.get("usuarioId") == null) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "Falta el ID de usuario en el envío"));
            }

            Long usuarioId = Long.valueOf(payload.get("usuarioId").toString());
            
            // Buscamos al usuario en la DB limpia de Docker
            Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("El usuario con ID " + usuarioId + " no existe en la base de datos actual."));

            Direccion nueva = new Direccion();
            nueva.setUsuario(usuario);
            nueva.setCalle(payload.get("calle").toString());
            nueva.setAltura(payload.get("altura").toString());
            nueva.setPisoDepto(payload.get("pisoDepto") != null ? payload.get("pisoDepto").toString() : "");
            nueva.setLocalidad(payload.get("localidad").toString());
            nueva.setProvincia(payload.get("provincia").toString());
            nueva.setCodigoPostal(payload.get("codigoPostal").toString());
            nueva.setPredeterminada(true);

            direccionRepository.save(nueva);
            return ResponseEntity.ok(Map.of("mensaje", "¡Dirección guardada con éxito!", "id", nueva.getId()));

        } catch (Exception e) {
            System.err.println("ERROR CRITICO: " + e.getMessage());
            e.printStackTrace(); 
            return ResponseEntity.status(500).body(Map.of("mensaje", "Error interno: " + e.getMessage()));
        }
    }
}