package com.platonic.data.access.search.impl;

import com.platonic.contracts.search.SearchCriteria;
import com.platonic.contracts.search.SearchResult;
import com.platonic.data.access.search.SearchRepository;
import com.platonic.models.tags.TagType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.RowMapperResultSetExtractor;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class SearchRepositoryImpl implements SearchRepository {
    long DAY_IN_MS = 1000 * 60 * 60 * 24;

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public SearchResult[] search(SearchCriteria searchCriteria) {

        List<SearchResult> searchResults = jdbcTemplate.query(generateSearchQuery(searchCriteria), new RowMapper<SearchResult>() {
            private int order = 0;

            @Override
            public SearchResult mapRow(ResultSet resultSet, int i) throws SQLException {
                SearchResult result = new SearchResult();

                Object groupId = resultSet.getObject("groupId");
                if (groupId != null) {
                    if (groupId instanceof Long) {
                        result.setEntityId((Long) groupId);
                    } else if (groupId instanceof String) {
                        result.setEntityId(Long.parseLong((String) groupId));
                    }
                    result.setEntityType(SearchResult.EntityType.GROUP);
                }

                Object userId = resultSet.getObject("userId");
                if (userId != null) {
                    if (userId instanceof Long) {
                        result.setEntityId((Long) userId);
                    } else if (userId instanceof String) {
                        result.setEntityId(Long.parseLong((String) userId));
                    }
                    result.setEntityType(SearchResult.EntityType.USER);
                }

                result.setOrder(order++);

                return result;
            }
        });

        return searchResults.toArray(new SearchResult[searchResults.size()]);
    }

    private String generateSearchQuery(SearchCriteria searchCriteria) {
        StringBuilder builder = new StringBuilder("( ");

        if (searchCriteria.isSearchForUsers()) {
            builder.append(getUserQueryString(searchCriteria));

            builder.append(" ) ");
            if (searchCriteria.isSearchForGroups()) {
                builder.append(" UNION ALL ( ");
            }
        }

        if (searchCriteria.isSearchForGroups()) {
            builder.append(getGroupQueryString(searchCriteria));
            builder.append(" ) ");
        }

        if (searchCriteria.getTags().size() > 0) {
            builder.append(" ORDER BY tagCount desc");
            if (!searchCriteria.isOnlineOnly()) {
                builder.append(", distance ");
            }
        } else if (!searchCriteria.isOnlineOnly()) {
            builder.append(" ORDER BY weight, distance ");
        } else {
            builder.append(" ORDER BY weight, generalId ");
        }

        return builder.toString();
    }

    private String getUserQueryString(SearchCriteria searchCriteria) {
        StringBuilder builder = new StringBuilder();

        builder.append(" SELECT usr.user_id AS generalId, usr.user_id AS userId, null AS groupId, CASE WHEN Count(ut.tag_id) > 0 || ud.image_id is not null THEN 1 ELSE 2 END AS weight ");
        if (searchCriteria.getTags().size() > 0) {
            builder.append(", Count(ut.tag_id) AS tagCount ");
        }

        if (!searchCriteria.isOnlineOnly()) {
            builder.append(", (3959 * acos( cos( radians( " + searchCriteria.getLatitude() + " ) ) * cos( radians( ud.latitude ) ) * cos( radians( ud.longitude ) - radians( " + searchCriteria.getLongitude() + " ) ) + sin(radians( " + searchCriteria.getLatitude() + " )) * sin(radians( ud.latitude )) ) ) as distance ");
        }

        builder.append(" FROM users usr INNER JOIN user_details ud ON ud.user_id = usr.user_id AND usr.enabled = true AND usr.locked = false AND ud.online_only = ");
        builder.append(searchCriteria.isOnlineOnly());

        if (!searchCriteria.getIncludeInactives()) {
            builder.append(" AND ud.last_activity > '");
            builder.append(getTwoWeekLookback().toString());
            builder.append("' ");
        }

        if (searchCriteria.isFilteredByGender() && !searchCriteria.isSearchForGroups()) {
            builder.append(" AND ud.sex = ");
            builder.append(searchCriteria.getSex().ordinal());
        }

        if (searchCriteria.getExecutedByUserId() != null) {
            builder.append(" AND ud.looking_for_individuals = true ");
        }

        if (searchCriteria.getExecutedByGroupId() != null) {
            builder.append(" AND ud.looking_for_groups = true ");
        }

        if (searchCriteria.getNameSearch() != null && searchCriteria.getNameSearch().length() > 0) {
            builder.append(" AND UPPER(usr.username) like UPPER('%");
            builder.append(searchCriteria.getNameSearch());
            builder.append("%') ");
        }

        if (searchCriteria.isUseAgeRange()) {
            builder.append(" AND DATE_FORMAT(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(ud.birthdate)), '%Y')+0 > ");
            builder.append(searchCriteria.getStartAge());
            builder.append(" AND DATE_FORMAT(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(ud.birthdate)), '%Y')+0 < ");
            builder.append(searchCriteria.getEndAge());
            builder.append(" ");
        }

        if (searchCriteria.getTags().size() > 0) {
            builder.append(" INNER JOIN user_tags ut ON ut.user_id = ud.user_id INNER JOIN tags t ON t.tag_id = ut.tag_id ");
            builder.append(" AND lower(t.display) IN ( ");
            builder.append(getTagClause(searchCriteria.getTags()));
            builder.append(" ) ");

            if (searchCriteria.getExecutedByUserId() != null) {
                builder.append(" AND ut.tag_type in ( ");
                builder.append(TagType.PERSONAL.ordinal());
                builder.append(", ");
                builder.append(TagType.INTERESTS.ordinal());
                builder.append(", ");
                builder.append(TagType.USER_SEARCH.ordinal());
                builder.append(" ) ");
            } else {
                builder.append(" AND ut.tag_type in ( ");
                builder.append(TagType.PERSONAL.ordinal());
                builder.append(", ");
                builder.append(TagType.INTERESTS.ordinal());
                builder.append(", ");
                builder.append(TagType.GROUP_SEARCH.ordinal());
                builder.append(" ) ");
            }
        } else {
            builder.append(" LEFT OUTER JOIN user_tags ut ON ut.user_id = ud.user_id ");
        }

        builder.append(" GROUP BY userId, groupId ");

        if (!searchCriteria.isOnlineOnly()) {
            builder.append(" HAVING distance < ");
            builder.append(searchCriteria.getSearchRadiusInMiles());
        }

        if (searchCriteria.getTags().size() > 0) {
            builder.append(" ORDER BY tagCount desc");
            if (!searchCriteria.isOnlineOnly()) {
                builder.append(", distance ");
            }
        } else if (!searchCriteria.isOnlineOnly()) {
            builder.append(" ORDER BY distance ");
        } else {
            builder.append(" ORDER BY generalId ");
        }

        builder.append(" LIMIT ");
        builder.append(searchCriteria.getPageSize());
        builder.append(" ");

        return builder.toString();
    }

    private String getGroupQueryString(SearchCriteria searchCriteria) {
        StringBuilder builder = new StringBuilder();

        builder.append(" SELECT grp.group_id AS generalId, null AS userId, grp.group_id AS groupId, CASE WHEN Count(gt.tag_id) > 0 || gd.image_id is not null THEN 1 ELSE 2 END AS weight ");

        if (searchCriteria.getTags().size() > 0) {
            builder.append(", Count(gt.tag_id) AS tagCount ");
        }

        if (!searchCriteria.isOnlineOnly()) {
            builder.append(", (3959 * acos( cos( radians( " + searchCriteria.getLatitude() + " ) ) * cos( radians( gd.latitude ) ) * cos( radians( gd.longitude ) - radians( " + searchCriteria.getLongitude() + " ) ) + sin(radians( " + searchCriteria.getLatitude() + " )) * sin(radians( gd.latitude )) ) ) as distance ");
        }

        builder.append(" FROM groups grp INNER JOIN group_details gd ON gd.group_id = grp.group_id AND grp.enabled = true AND gd.online_only = ");
        builder.append(searchCriteria.isOnlineOnly());

        if (searchCriteria.getExecutedByUserId() != null) {
            builder.append(" AND gd.looking_for_individuals = true ");
        }

        if (searchCriteria.getExecutedByGroupId() != null) {
            builder.append(" AND gd.looking_for_groups = true ");
        }

        if (searchCriteria.getNameSearch() != null && searchCriteria.getNameSearch().length() > 0) {
            builder.append(" AND UPPER(gd.name) like UPPER('%");
            builder.append(searchCriteria.getNameSearch());
            builder.append("%') ");
        }

        if (searchCriteria.isUseAgeRange()) {
            builder.append(" AND ( ( gd.suggested_birthdate = false OR gd.suggested_birthdate is null OR gd.suggested_birthdate is null ) OR ( ");
            builder.append(" DATE_FORMAT(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(gd.suggested_birthdate)), '%Y')+0 > ");
            builder.append(searchCriteria.getStartAge());
            builder.append(" AND DATE_FORMAT(FROM_DAYS(TO_DAYS(NOW())-TO_DAYS(gd.suggested_birthdate)), '%Y')+0 < ");
            builder.append(searchCriteria.getEndAge());
            builder.append(" ) ) ");
        }

        builder.append(" INNER JOIN chat_members cm on cm.group_id = grp.group_id INNER JOIN chats c on c.chat_id = cm.chat_id and c.is_active = true ");

        if (!searchCriteria.getIncludeInactives()) {
            builder.append(" AND c.last_activity > '");
            builder.append(getTwoWeekLookback().toString());
            builder.append("' ");
        }

        if (searchCriteria.getTags().size() > 0) {
            builder.append(" INNER JOIN group_tags gt ON gt.group_id = gd.group_id INNER JOIN tags t ON t.tag_id = gt.tag_id ");
            builder.append(" AND lower(t.display) IN (");
            builder.append(getTagClause(searchCriteria.getTags()));
            builder.append(" ) ");

            if (searchCriteria.getExecutedByUserId() != null) {
                builder.append(" AND gt.tag_type in ( ");
                builder.append(TagType.PERSONAL.ordinal());
                builder.append(", ");
                builder.append(TagType.INTERESTS.ordinal());
                builder.append(", ");
                builder.append(TagType.USER_SEARCH.ordinal());
                builder.append(" ) ");
            } else {
                builder.append(" AND gt.tag_type in ( ");
                builder.append(TagType.PERSONAL.ordinal());
                builder.append(", ");
                builder.append(TagType.INTERESTS.ordinal());
                builder.append(", ");
                builder.append(TagType.GROUP_SEARCH.ordinal());
                builder.append(" ) ");
            }
        } else {
            builder.append(" LEFT OUTER JOIN group_tags gt ON gt.group_id = gd.group_id ");
        }

        builder.append(" GROUP BY userId, groupId ");

        if (!searchCriteria.isOnlineOnly()) {
            builder.append(" HAVING distance < ");
            builder.append(searchCriteria.getSearchRadiusInMiles());
        }

        if (searchCriteria.getTags().size() > 0) {
            builder.append(" ORDER BY tagCount desc");
            if (!searchCriteria.isOnlineOnly()) {
                builder.append(", distance ");
            }
        } else if (!searchCriteria.isOnlineOnly()) {
            builder.append(" ORDER BY distance ");
        } else {
            builder.append(" ORDER BY generalId ");
        }

        builder.append(" LIMIT ");
        builder.append(searchCriteria.getPageSize());
        builder.append(" ");

        return builder.toString();
    }

    private String getTagClause(List<SearchCriteria.ViewableTag> tags) {
        StringBuilder builder = new StringBuilder();

        for (SearchCriteria.ViewableTag viewableTag : tags) {
            builder.append("'");
            builder.append(viewableTag.getDisplay().toLowerCase());
            builder.append("',");
        }
        builder.replace(builder.length() -1, builder.length(), " ");

        return builder.toString();
    }

    private Timestamp getTwoWeekLookback() {
        return  new Timestamp(new java.util.Date().getTime() - (14 * DAY_IN_MS));
    }
}
