package com.neosuplex.neosuplexapi;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DireccionRepository extends JpaRepository<Direccion, Long> {
    // Busca todas las direcciones que le pertenecen a un usuario específico
    List<Direccion> findByUsuarioId(Long usuarioId);
    
    // Nos sirve para encontrar cuál era la predeterminada anterior y desmarcarla
    Optional<Direccion> findByUsuarioIdAndPredeterminadaTrue(Long usuarioId);
}