package com.platonic.data.access.tags;

import com.platonic.models.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Long> {

    @Query(value = "SELECT t.tagId, t.display, COUNT(ut.tag) AS occurrence_count FROM UserTag ut INNER JOIN ut.tag t WHERE LOWER(t.display) LIKE LOWER(CONCAT(:search, '%')) GROUP BY t.tagId ORDER BY occurrence_count")
    List<Object[]> countTopUserTagUsageFilterByDisplayLimited(@Param("search") String search, Pageable pageable);

    @Query(value = "SELECT t.tagId, t.display, COUNT(gt.tag) AS occurrence_count FROM GroupTag gt INNER JOIN gt.tag t WHERE LOWER(t.display) LIKE LOWER(CONCAT(:search, '%')) GROUP BY t.tagId ORDER BY occurrence_count")
    List<Object[]> countTopGroupTagUsageFilterByDisplayLimited(@Param("search") String search, Pageable pageable);

    List<Tag> findByDisplayInIgnoreCase(List<String> displayList);
}
