package pe.edu.continental.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
@Document(collection="citas")
public class Cita{
    @Id private String id;
    private String ownerUid;
    private String especie;
    private Instant fechaHoraUtc;
    public String getId(){return id;}
    public String getOwnerUid(){return ownerUid;}
    public String getEspecie(){return especie;}
    public Instant getFechaHoraUtc(){return fechaHoraUtc;}
}
