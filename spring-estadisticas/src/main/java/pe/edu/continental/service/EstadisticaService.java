package pe.edu.continental.service;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.bson.Document;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class EstadisticaService {
    private final MongoTemplate mongo;

    public EstadisticaService(MongoTemplate mongo) {
        this.mongo = mongo;
    }

    public Map<String, Object> obtener(String uid) {
        long total = mongo.getCollection("citas").countDocuments(new Document("ownerUid", uid));

        List<Map<String, Object>> especies = agrupar(uid, "especie", "especie");
        List<Map<String, Object>> estados = agrupar(uid, "estado", "estado");

        List<Document> pipeline = List.of(
            new Document("$match", new Document("ownerUid", uid)
                .append("fechaHoraUtc", new Document("$type", "date"))),
            new Document("$group", new Document("_id",
                new Document("$dateToString", new Document("format", "%Y-%m")
                    .append("date", "$fechaHoraUtc")
                    .append("timezone", "America/Lima")))
                .append("cantidad", new Document("$sum", 1))),
            new Document("$sort", new Document("_id", -1)),
            new Document("$limit", 12)
        );

        List<Document> meses = mongo.getCollection("citas")
            .aggregate(pipeline).into(new ArrayList<>());
        Collections.reverse(meses);
        List<Map<String, Object>> porMes = meses.stream()
            .map(d -> Map.<String, Object>of(
                "mes", Objects.toString(d.get("_id"), "Sin definir"),
                "cantidad", ((Number) d.get("cantidad")).longValue()))
            .toList();

        return Map.of(
            "total", total,
            "porEspecie", especies,
            "porEstado", estados,
            "porMes", porMes
        );
    }

    private List<Map<String, Object>> agrupar(String uid, String campo, String nombre) {
        List<Document> pipeline = List.of(
            new Document("$match", new Document("ownerUid", uid)),
            new Document("$group", new Document("_id", "$" + campo)
                .append("cantidad", new Document("$sum", 1))),
            new Document("$sort", new Document("_id", 1))
        );

        return mongo.getCollection("citas").aggregate(pipeline)
            .into(new ArrayList<Document>())
            .stream()
            .map(d -> Map.<String, Object>of(
                nombre, Objects.toString(d.get("_id"), "Sin definir"),
                "cantidad", ((Number) d.get("cantidad")).longValue()))
            .toList();
    }
}
