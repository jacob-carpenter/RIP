package com.platonic.controllers.search;

import com.platonic.contracts.search.SearchCriteria;
import com.platonic.contracts.search.SearchResult;
import com.platonic.services.search.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("api/search")
public class SearchController {
    @Autowired
    private SearchService searchService;

    @RequestMapping(method = RequestMethod.POST)
    public SearchResult[] search(@RequestBody SearchCriteria searchCriteria) {
        return searchService.search(searchCriteria);
    }
}
