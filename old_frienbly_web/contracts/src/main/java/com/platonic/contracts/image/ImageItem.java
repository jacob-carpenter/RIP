package com.platonic.contracts.image;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ImageItem {
    private String imageId;

    private String image;

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
