import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import PageKeys from './PageKeys';
import PhotoModalPage from './PhotoModalPage';
import CameraView from './CameraView';
import AlbumListView from './AlbumListView';
import AlbumView from './AlbumView';
import NeutralView from './NeutralView';
import PreviewMultiView from './PreviewMultiView';
import {createStackNavigator} from "react-navigation";
import {NeonHandler} from "./NeonHandler";

import App from '../App';
import App1 from '../App1';
import App2 from '../App2';
import App3 from '../App3';

/**
 * --OPTIONS--
 * maxSize?: number. Camera or Video.
 * sideType?: RNCamera.Constants.Type. Camera or Video.
 * flashMode?: RNCamera.Constants.FlashMode. Camera or Video.
 * pictureOptions?: RNCamera.PictureOptions. Camera.
 * recordingOptions?: RNCamera.RecordingOptions Video.
 * callback: (data: any[]) => void. Donot use Alert.
 */
export const neonNavigator = createStackNavigator({
    [PageKeys.camera]: {screen: CameraView, navigationOptions: {header: null}},
    [PageKeys.album_list]: {screen: AlbumListView, navigationOptions: {header: null}},
    [PageKeys.album_view]: {screen: AlbumView, navigationOptions: {header: null}},
    [PageKeys.preview]: {screen: PreviewMultiView, navigationOptions: {header: null}},
    [PageKeys.neutral]: {screen: NeutralView, navigationOptions: {header: null}}
});

export const getCamera = (options) => showImagePicker(PageKeys.camera, {...options, isVideo: false});
export const getVideo = (options) => showImagePicker(PageKeys.camera, {...options, isVideo: true});
export const getAlbum = (options) => showImagePicker(PageKeys.album_list, options);
export const openNeutral = (options) => showImagePicker(PageKeys.neutral, options);

let sibling = null;

function showImagePicker(initialRouteName, options) {
    NeonHandler.initialize();
    console.log(JSON.stringify(options))
    if(options.navigation && options.resultRoute && options.callback){
        options.navigation.navigate(initialRouteName);
    }
    /*if (sibling) {
        return null;
    }
    sibling = new RootSiblings(
        <PhotoModalPage
            initialRouteName={initialRouteName}
            onDestroy={() => {
                sibling && sibling.destroy();
                sibling = null;
            }}
            {...options}
        />
    );*/
}

export {
    PhotoModalPage,
    CameraView,
    PreviewMultiView,
    AlbumListView,
    AlbumView,
};
