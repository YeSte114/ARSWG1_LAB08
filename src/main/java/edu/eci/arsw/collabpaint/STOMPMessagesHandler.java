package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;
    ConcurrentHashMap<String, ArrayList<Point>> poligon = new ConcurrentHashMap<String, ArrayList<Point>>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!: " + pt);
        ArrayList<Point> s = new ArrayList<>();
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);

        System.out.println(poligon.toString());
        System.out.println(poligon.containsValue(numdibujo));
        if (poligon.containsKey(numdibujo)) {
            System.out.println("Entro 1");
            poligon.get(numdibujo).add(pt);
            if (poligon.get(numdibujo).size() >= 3) {
                System.out.println("Entro 2");
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, poligon.get(numdibujo));
            }
        } else {
            System.out.println("Entro 0");
            s.add(pt);
            poligon.put(numdibujo, s);

        }
    }
}