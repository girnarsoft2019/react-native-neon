import React from 'react';
import PageKeys from './PageKeys';
import CameraView from './CameraView';
import AlbumListView from './AlbumListView';
import AlbumView from './AlbumView';
import NeutralView from './NeutralView';
import ImageReviewView from './ImageReviewView';
import {NeonHandler} from './NeonHandler';

export const LIBRARY_MODE = {
    SOFT: 0,
    HARD: 1,
};

export const RESPONSE_CODE = {
    BACK_PRESSED: 0,
    SUCCESS: 1,
};

export const IMAGE_SOURCE = {
    CAMERA: 'Camera',
    GALLERY: 'Gallery',
};

export const CAMERA_TYPE = {
    REAR: 0,
    FRONT: 1,
};

export const ORIENTATION = {
    PORTRAIT: 0,
    LANDSCAPE: 1,
};

export const FLASH_MODE = {
    AUTO: 0,
    ON: 1,
    OFF: 2,
};

export const neonNavigator = {
    [PageKeys.camera]: {screen: CameraView, navigationOptions: {header: null}},
    [PageKeys.album_list]: {screen: AlbumListView, navigationOptions: {header: null}},
    [PageKeys.album_view]: {screen: AlbumView, navigationOptions: {header: null}},
    [PageKeys.neutral]: {screen: NeutralView, navigationOptions: {header: null}},
    [PageKeys.image_review]: {screen: ImageReviewView, navigationOptions: {header: null}},
};

export const openCamera = (options) => showImagePicker({...options, initialRoute: PageKeys.camera});
export const openGallery = (options) => showImagePicker({...options, initialRoute: PageKeys.album_list});
export const openNeutral = (options) => showImagePicker({...options, initialRoute: PageKeys.neutral});

function showImagePicker(options) {
    NeonHandler.clearInstance();
    NeonHandler.initialize(options, options.alreadyAddedImages);
    console.log(JSON.stringify(NeonHandler.getOptions()));
    if (options.navigation && options.initialRoute && options.callback) {
        options.navigation.navigate(options.initialRoute);
    }
}

/*
* private String filePath;
    private FILE_TYPE type;
    private String fileName;
    private String displayName;
    private boolean selected;
    private SOURCE source;
    private int fileCount;
    private String dateTimeTaken;
    private ImageTagModel fileTag;
    private String latitude;
    private String longitude;
    private String timestamp;*/

/*private String tagName;
    private boolean mandatory;
    private String tagId;
    private int numberOfPhotos;
    private Location location;
    private String tagPreviewUrl;*/

