package com.platonic.services.storage.impl;

import com.platonic.services.storage.StorageService;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Primary
public class FileSystemStorageServiceImpl implements StorageService {
    @Override
    public Resource loadFile(String pathToFile, String fileName) {
        try {
            Path file = Paths.get(pathToFile).resolve(fileName);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Failed to find image.");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Failed to find image.", e);
        }
    }

    @Override
    public void store(String pathToFile, String fileName, MultipartFile file) {
        try {
            Path path = Paths.get(pathToFile);

            if (!Files.exists(path))
                Files.createDirectory(path);

            Files.copy(file.getInputStream(), path.resolve(fileName));
        } catch (Exception e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    @Override
    public void delete(String pathToFile, String fileName) {
        try {
            Path path = Paths.get(pathToFile);

            if (!Files.exists(path))
                return;

            Files.delete(path.resolve(fileName));
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file.", e);
        }
    }
}
