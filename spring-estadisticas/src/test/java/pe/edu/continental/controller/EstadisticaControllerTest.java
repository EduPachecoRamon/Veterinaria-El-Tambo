package pe.edu.continental.controller;
import pe.edu.continental.service.EstadisticaService;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class EstadisticaControllerTest{
    @Test void bloqueaSinClave(){var s=mock(EstadisticaService.class);var c=new EstadisticaController(s,"clave-privada");assertThrows(ResponseStatusException.class,()->c.obtener(null,"usuario"));verifyNoInteractions(s);}
    @Test void rechazaClaveIncorrecta(){var s=mock(EstadisticaService.class);var c=new EstadisticaController(s,"clave-privada");assertThrows(ResponseStatusException.class,()->c.obtener("otra","usuario"));verifyNoInteractions(s);}
    @Test void aceptaClaveCorrecta(){var s=mock(EstadisticaService.class);when(s.obtener("usuario")).thenReturn(Map.of("total",2));var c=new EstadisticaController(s,"clave-privada");assertEquals(2,c.obtener("clave-privada","usuario").get("total"));}
}
