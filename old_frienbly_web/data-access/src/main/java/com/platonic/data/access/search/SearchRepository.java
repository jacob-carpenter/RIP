package com.platonic.data.access.search;

import com.platonic.contracts.search.SearchCriteria;
import com.platonic.contracts.search.SearchResult;

public interface SearchRepository {
    SearchResult[] search(SearchCriteria searchCriteria);
}
