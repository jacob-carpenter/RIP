package com.platonic.services.search;

import com.platonic.contracts.search.SearchCriteria;
import com.platonic.contracts.search.SearchResult;

public interface SearchService {
    SearchResult[] search(SearchCriteria searchCriteria);
}
