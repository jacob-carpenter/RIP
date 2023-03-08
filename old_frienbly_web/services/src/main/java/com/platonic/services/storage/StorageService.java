package com.platonic.services.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    Resource loadFile(String pathToFile, String fileName);

    void store(String pathToFile, String fileName, MultipartFile file);

    void delete(String pathToFile, String fileName);
}
