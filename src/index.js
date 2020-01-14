import React from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import PageKeys from './PageKeys';
import CameraView from './CameraView';
import AlbumListView from './AlbumListView';
import AlbumView from './AlbumView';
import NeutralView from './NeutralView';
import ImageReviewView from './ImageReviewView';
import Toast from 'react-native-simple-toast';
import {NeonHandler} from './NeonHandler';

export const LIBRARY_MODE = {
    SOFT: 0,
    HARD: 1,
};

export const RESPONSE_CODE = {
    BACK_PRESSED: 0,
    SUCCESS: 1,
    PERMISSION_DENIED: 2,
    PERMISSION_REVOKED: 3,
};

export const IMAGE_SOURCE = {
    CAMERA: 'PHONE_CAMERA',
    GALLERY: 'PHONE_GALLERY',
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

async function showImagePicker(options) {
    let status = await hasPermissions(options);
    if (status === 1) {
        NeonHandler.clearInstance();
        NeonHandler.initialize(options, options.alreadyAddedImages);
        console.log(JSON.stringify(NeonHandler.getOptions()));
        if (options.navigation && options.initialRoute && options.callback) {
            options.navigation.navigate(options.initialRoute);
        }
    } else {
        if (options.callback) {
            options.callback({
                    data: [],
                    responseCode: status,
                },
            );
        }
    }
}

async function hasPermissions(options) {
    if (Platform.OS === 'ios' ||
        (Platform.OS === 'android' && Platform.Version < 23)) {
        return 1;
    }

    let hasLocationPermission = true;
    let locationPermissionRequired = false;
    if (options.locationRestrictive) {
        locationPermissionRequired = true;
        hasLocationPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
    }

    const hasCameraPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    const hasStoragePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );

    if (hasCameraPermission && hasStoragePermission && hasLocationPermission) {
        return 1;
    }

    if (locationPermissionRequired) {
        const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]);
        console.log(granted[PermissionsAndroid.PERMISSIONS.CAMERA], granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE], granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]);
        if (granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED && granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED && granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED) {
            return 1;
        } else if (granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN || granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN || granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Toast.show('Permission revoked by user.', Toast.SHORT);
            return RESPONSE_CODE.PERMISSION_REVOKED;
        } else {
            Toast.show('Permission denied by user.', Toast.SHORT);
            return RESPONSE_CODE.PERMISSION_DENIED;
        }
    } else {
        const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]);
        console.log(granted[PermissionsAndroid.PERMISSIONS.CAMERA], granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]);
        if (granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED && granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED) {
            return 1;
        } else if (granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN || granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Toast.show('Permission revoked by user.', Toast.SHORT);
            return RESPONSE_CODE.PERMISSION_REVOKED;
        } else {
            Toast.show('Permission denied by user.', Toast.SHORT);
            return RESPONSE_CODE.PERMISSION_DENIED;
        }
    }

    /*const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (status === PermissionsAndroid.RESULTS.DENIED) {
        Toast.show('Permission denied by user.', Toast.SHORT);
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Toast.show('Permission revoked by user.', Toast.SHORT);
    }*/
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

