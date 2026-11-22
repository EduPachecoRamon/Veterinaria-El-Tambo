package pe.edu.continental.service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.bson.Document;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
@Service
public class EstadisticaService{
    private final MongoTemplate mongo;
    public EstadisticaService(MongoTemplate mongo){this.mongo=mongo;}
    public Map<String,Object> obtener(String uid){
        var criterio=Criteria.where("ownerUid").is(uid);
        long total=mongo.count(Query.query(criterio),"citas");
        var pipeline=Aggregation.newAggregation(Aggregation.match(Criteria.where("ownerUid").is(uid)),Aggregation.group("especie").count().as("cantidad"),Aggregation.project("cantidad").and("_id").as("especie"),Aggregation.sort(org.springframework.data.domain.Sort.Direction.ASC,"especie"));
        List<Map<String,Object>> especies=mongo.aggregate(pipeline,"citas",Document.class).getMappedResults().stream().map(d->Map.<String,Object>of("especie",d.getString("especie"),"cantidad",d.get("cantidad"))).toList();
        return Map.of("total",total,"porEspecie",especies);
    }
}
