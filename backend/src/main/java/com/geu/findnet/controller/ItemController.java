package com.geu.findnet.controller;

import com.geu.findnet.entity.ActivityLog;
import com.geu.findnet.entity.Item;
import com.geu.findnet.entity.User;
import com.geu.findnet.repository.ActivityLogRepository;
import com.geu.findnet.repository.ItemRepository;
import com.geu.findnet.repository.UserRepository;
import com.geu.findnet.service.MatchEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MatchEngineService matchEngineService;

    @PostMapping("/report")
    public ResponseEntity<?> reportItem(@RequestParam Long userId, @RequestBody Item item) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        item.setOwner(user);
        item.setTimestamp(LocalDateTime.now());
        
        Item savedItem = itemRepository.save(item);

        // Enqueue for matching if Lost or found reported
        matchEngineService.enqueueItemForProcessing(savedItem);

        // Create log
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        if (item.getType() == Item.ItemType.LOST_REPORT) {
            log.setAction("Reported lost item: " + item.getName());
            log.setFilterCategory("LOST");
        } else {
            log.setAction("Reported founded item: " + item.getName());
            log.setFilterCategory("FOUNDED");
        }
        activityLogRepository.save(log);

        return ResponseEntity.ok(savedItem);
    }

    @GetMapping("/my-activity")
    public ResponseEntity<?> getUserActivity(@RequestParam Long userId) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/return/{itemId}")
    public ResponseEntity<?> returnItem(@PathVariable Long itemId, @RequestParam Long userId) {
        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Item not found");
        }
        Item item = itemOpt.get();
        
        // Owner or Finder marking return
        item.setStatus(Item.ItemStatus.RETURNED);
        itemRepository.save(item);

        User user = userRepository.findById(userId).orElseThrow();
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setAction("Marked item as RETURNED: " + item.getName());
        log.setFilterCategory("RETURNED");
        activityLogRepository.save(log);

        return ResponseEntity.ok(item);
    }
}
