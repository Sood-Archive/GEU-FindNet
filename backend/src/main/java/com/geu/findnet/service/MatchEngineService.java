package com.geu.findnet.service;

import com.geu.findnet.entity.Item;
import com.geu.findnet.repository.ItemRepository;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class MatchEngineService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private NLPService nlpService;

    @Value("${spring.sendgrid.api-key}")
    private String sendGridApiKey;

    private Queue<Item> processQueue = new ConcurrentLinkedQueue<>();

    public void enqueueItemForProcessing(Item item) {
        processQueue.add(item);
        processMatches(); // Synchronous call here for simplicity
    }

    private void processMatches() {
        while (!processQueue.isEmpty()) {
            Item newItem = processQueue.poll();

            List<Item> candidates;
            if (newItem.getType() == Item.ItemType.LOST_REPORT) {
                candidates = itemRepository.findByStatusAndType(Item.ItemStatus.FOUND, Item.ItemType.FOUND_REPORT);
            } else {
                candidates = itemRepository.findByStatusAndType(Item.ItemStatus.LOST, Item.ItemType.LOST_REPORT);
            }

            for (Item candidate : candidates) {
                double similarity = nlpService.calculateSimilarity(newItem.getDescription(), candidate.getDescription());
                if (similarity > 75.0) {
                    sendMatchNotification(newItem, candidate);
                }
            }
        }
    }

    private void sendMatchNotification(Item item1, Item item2) {
        // SendGrid logic to notify owner
        Item lost = (item1.getType() == Item.ItemType.LOST_REPORT) ? item1 : item2;
        Item found = (item1.getType() == Item.ItemType.FOUND_REPORT) ? item1 : item2;

        String ownerEmail = lost.getOwner().getPersonalEmail();
        String finderEmail = found.getOwner().getPersonalEmail();
        String finderPhone = found.getContactPhone();

        Email from = new Email("noreply@geufindnet.example.com");
        String subject = "Match found for your lost item: " + lost.getName();
        Email to = new Email(ownerEmail);
        Content content = new Content("text/plain", 
            "We found a potential match for your lost item! \n" +
            "Item details: " + found.getDescription() + "\n" +
            "Please contact the finder. \n" +
            "Contact Phone: " + finderPhone + "\n" +
            "Contact Email: " + finderEmail
        );
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            System.out.println("Match Email Sent! Status Code: " + response.getStatusCode());
        } catch (IOException ex) {
            System.err.println("Error sending match email: " + ex.getMessage());
        }
    }
}
