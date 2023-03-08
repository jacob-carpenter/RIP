package com.platonic.contracts.image.replies;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.platonic.contracts.image.ImageItem;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ImageReply {
    private List<ImageItem> images;

    public List<ImageItem> getImages() {
        return images;
    }

    public void setImages(List<ImageItem> images) {
        this.images = images;
    }
}
