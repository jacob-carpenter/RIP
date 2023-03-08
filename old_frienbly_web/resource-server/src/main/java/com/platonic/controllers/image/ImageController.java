package com.platonic.controllers.image;

import com.platonic.contracts.image.ImageItem;
import com.platonic.contracts.image.replies.ImageReply;
import com.platonic.contracts.image.requests.ImageRetrievalRequest;
import com.platonic.services.storage.StorageService;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;

@RestController()
@RequestMapping("api/image")
public class ImageController implements InitializingBean {

    @Autowired
    private StorageService storageService;

    @Value("${frienble.image.path}")
    private String filePath;

    @Value("${reset.images}")
    private boolean resetImages;

    @Override
    public void afterPropertiesSet() throws Exception {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path))
                Files.createDirectory(path);

            if (resetImages) {
                FileSystemUtils.deleteRecursively(new File(filePath));
                Files.createDirectory(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage!");
        }
    }

    @RequestMapping(path="{imageId}", method = RequestMethod.POST)
    public ImageReply save(@PathVariable String imageId, @RequestBody MultipartFile image) {
        storageService.store(getImagePath(imageId), imageId, image);

        ImageReply reply = new ImageReply();
        ImageItem imageItem = new ImageItem();
        imageItem.setImageId(imageId);

        reply.setImages(Collections.singletonList(imageItem));
        return reply;
    }

    @RequestMapping(method = RequestMethod.POST)
    public ImageReply get(@RequestBody ImageRetrievalRequest imageRetrievalRequest) {
        ImageReply reply = new ImageReply();
        List<ImageItem> retrievedImages = new ArrayList<>();
        reply.setImages(retrievedImages);

        for (String imageId : imageRetrievalRequest.getImageIds()) {
            try {
                ImageItem retrievedImage = new ImageItem();
                retrievedImage.setImageId(imageId);
                retrievedImage.setImage(getImage(storageService.loadFile(getImagePath(imageId), imageId)));
                retrievedImages.add(retrievedImage);
            } catch (Exception e) {
                // Don't fail and move on to next image request.
                continue;
            }
        }
        return reply;
    }

    @RequestMapping(path="{imageId}", method = RequestMethod.DELETE)
    public void delete(@PathVariable String imageId) {
        storageService.delete(getImagePath(imageId), imageId);
    }

    private String getImage(Resource resource) {
        FileInputStream fin = null;
        try {
            fin = new FileInputStream(resource.getFile());
            byte fileContent[] = new byte[(int)resource.getFile().length()];

            fin.read(fileContent);

            return new String(Base64.getEncoder().encode(fileContent));
        }
        catch (FileNotFoundException e) {
            System.out.println("File not found" + e);
        }
        catch (IOException ioe) {
            System.out.println("Exception while reading file " + ioe);
        }
        finally {
            try {
                if (fin != null) {
                    fin.close();
                }
            }
            catch (IOException ioe) {
                System.out.println("Error while closing stream: " + ioe);
            }
        }
        return null;
    }

    private String getImagePath(String imageId) {
        return filePath + File.separator + imageId.substring(0, 2);
    }
}
