package com.platonic.data.access.tags.impl;

import com.platonic.contracts.search.SearchCriteria;
import com.platonic.data.access.tags.TagRelationRepository;
import com.platonic.models.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class TagRelationRepositoryImpl implements TagRelationRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<Tag> getAllRelatedTags(List<SearchCriteria.ViewableTag> viewableTagList) {
        List<Tag> tags = jdbcTemplate.query(generateTagQuery(viewableTagList), new RowMapper<Tag>() {

            @Override
            public Tag mapRow(ResultSet resultSet, int i) throws SQLException {
                Tag result = new Tag();

                result.setTagId(resultSet.getLong("tag_id"));
                result.setDisplay(resultSet.getString("display"));

                return result;
            }
        });

        tags.addAll(jdbcTemplate.query(generateGetSimilarTagQuery(viewableTagList), new RowMapper<Tag>() {


            @Override
            public Tag mapRow(ResultSet resultSet, int i) throws SQLException {
                Tag result = new Tag();

                result.setTagId(resultSet.getLong("tag_id"));
                result.setDisplay(resultSet.getString("display"));

                return result;
            }
        }));

        return tags;
    }

    private String generateGetSimilarTagQuery(List<SearchCriteria.ViewableTag> viewableTagList) {
        StringBuilder builder = new StringBuilder("SELECT t1.tag_id, t1.display from tags t1 WHERE ");
        builder.append(getSimilarTagClause("t1", viewableTagList));

        return builder.toString();
    }

    private String getSimilarTagClause(String tagAlias, List<SearchCriteria.ViewableTag> tags) {
        StringBuilder builder = new StringBuilder();

        for (SearchCriteria.ViewableTag viewableTag : tags) {
            builder.append(tagAlias);
            builder.append(".display like '%");
            builder.append(getGenericTagDisplay(viewableTag.getDisplay().trim().toLowerCase()));
            builder.append("%' OR ");
        }
        builder.replace(builder.length() - 3, builder.length(), " ");

        return builder.toString();
    }

    public String getGenericTagDisplay(String tagDisplay) {
        if (tagDisplay == null) {
            return "";
        } else if (tagDisplay.endsWith("ing")) {
            return tagDisplay.substring(0, tagDisplay.length() - 3);
        } else if (tagDisplay.endsWith("s")) {
            return tagDisplay.substring(0, tagDisplay.length() - 1);
        } else if (tagDisplay.endsWith("ed")) {
            return tagDisplay.substring(0, tagDisplay.length() - 2);
        }

        return tagDisplay;
    }

    private String generateTagQuery(List<SearchCriteria.ViewableTag> viewableTagList) {
        StringBuilder builder = new StringBuilder("SELECT t1.tag_id, t1.display from flattened_tag_relations ftr INNER JOIN tags t1 ON t1.tag_id = ftr.related_tag_id INNER JOIN tags t2 ON t2.tag_id = ftr.tag_id AND lower(t2.display) IN ( ");
        builder.append(getTagClause(viewableTagList));
        builder.append(" ) ");

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
}
