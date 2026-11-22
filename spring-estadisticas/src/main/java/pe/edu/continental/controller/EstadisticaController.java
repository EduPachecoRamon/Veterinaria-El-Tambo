package pe.edu.continental.controller;
import pe.edu.continental.service.EstadisticaService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
@RestController
@RequestMapping("/internal")
public class EstadisticaController{
    private final EstadisticaService service;
    private final String clave;
    public EstadisticaController(EstadisticaService service,@Value("${clinica.internal-key:}") String clave){this.service=service;this.clave=clave;}
    @GetMapping("/estadisticas")
    public Map<String,Object> obtener(@RequestHeader(value="X-Internal-Key",required=false) String provided,@RequestParam String uid){
        if(clave.isBlank()||provided==null||!MessageDigest.isEqual(clave.getBytes(StandardCharsets.UTF_8),provided.getBytes(StandardCharsets.UTF_8)))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if(uid.isBlank()||uid.length()>128)throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        return service.obtener(uid);
    }
}
