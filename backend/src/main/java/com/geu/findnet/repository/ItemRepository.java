package com.geu.findnet.repository;

import com.geu.findnet.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByStatusAndType(Item.ItemStatus status, Item.ItemType type);
    List<Item> findByOwnerIdOrderByTimestampDesc(Long ownerId);
}
