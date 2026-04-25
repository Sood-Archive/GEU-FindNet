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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class MatchEngineService {

    private static final Logger log = LoggerFactory.getLogger(MatchEngineService.class);

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
                log.info("Similarity between '{}' and '{}': {}%", newItem.getName(), candidate.getName(), String.format("%.1f", similarity));
                if (similarity > 40.0) {
                    sendMatchNotification(newItem, candidate);
                }
            }
        }
    }

    private void sendMatchNotification(Item item1, Item item2) {
        Item lost = (item1.getType() == Item.ItemType.LOST_REPORT) ? item1 : item2;
        Item found = (item1.getType() == Item.ItemType.FOUND_REPORT) ? item1 : item2;

        String ownerEmail  = lost.getOwner().getPersonalEmail();
        String finderEmail = found.getOwner().getPersonalEmail();
        String ownerName   = lost.getOwner().getFullName();
        String finderName  = found.getOwner().getFullName();
        String ownerPhone  = lost.getContactPhone();
        String finderPhone = found.getContactPhone();

        // Email to the person who LOST the item
        sendEmail(
            ownerEmail,
            "GEU FindNet – Potential Match Found for Your Lost Item",
            "Hello " + ownerName + ",\n\n" +
            "Great news! We found a potential match for your lost item.\n\n" +
            "Your lost item: " + lost.getName() + "\n" +
            "Location lost: " + lost.getLocation() + "\n\n" +
            "Matched found item: " + found.getName() + "\n" +
            "Location found: " + found.getLocation() + "\n" +
            "Description: " + found.getDescription() + "\n\n" +
            "Finder contact details:\n" +
            "  Name:  " + finderName + "\n" +
            "  Email: " + finderEmail + "\n" +
            "  Phone: " + finderPhone + "\n\n" +
            "Please reach out to the finder to claim your item.\n\n" +
            "– GEU FindNet Team"
        );

        // Email to the person who FOUND the item
        sendEmail(
            finderEmail,
            "GEU FindNet – Someone Is Looking for the Item You Found",
            "Hello " + finderName + ",\n\n" +
            "We found a potential match for the item you reported as found.\n\n" +
            "Item you found: " + found.getName() + "\n" +
            "Location found: " + found.getLocation() + "\n\n" +
            "Matched lost item: " + lost.getName() + "\n" +
            "Description: " + lost.getDescription() + "\n\n" +
            "Owner contact details:\n" +
            "  Name:  " + ownerName + "\n" +
            "  Email: " + ownerEmail + "\n" +
            "  Phone: " + ownerPhone + "\n\n" +
            "Please reach out to the owner to return the item.\n\n" +
            "– GEU FindNet Team"
        );
    }

    private void sendEmail(String toEmail, String subject, String body) {
        try {
            Email from = new Email("simrannegi6666@gmail.com", "GEU FindNet");
            Email to = new Email(toEmail);
            Content content = new Content("text/plain", body);
            Mail mail = new Mail(from, subject, to, content);

            SendGrid sg = new SendGrid(sendGridApiKey);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            System.out.println("Match email sent to " + toEmail + " | Status: " + response.getStatusCode());
        } catch (IOException ex) {
            System.err.println("Failed to send match email to " + toEmail + ": " + ex.getMessage());
        }
    }
}
