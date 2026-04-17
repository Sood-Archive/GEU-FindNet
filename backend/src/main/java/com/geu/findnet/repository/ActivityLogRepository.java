package com.geu.findnet.repository;

import com.geu.findnet.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findAllByOrderByTimestampDesc();
    List<ActivityLog> findByFilterCategoryOrderByTimestampDesc(String filterCategory);
    List<ActivityLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<ActivityLog> findByUserId(Long userId);
}
