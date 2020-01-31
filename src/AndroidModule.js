/*import MyModule from '../utils/MyModule';

export default MyModule;*/

'use strict';
import {Linking, NativeModules, Platform} from 'react-native';

const AndroidNativeModule = NativeModules.AndroidModule2;

function checkIfInitialized() {
    return AndroidNativeModule != null;
}

export default class AndroidModule {

    static scanFile(filePath) {
        if (!checkIfInitialized()) {
            return;
        }
        AndroidNativeModule.scanFile(filePath);
    }

    static isLocationEnable(callback: Function) {
        if (!checkIfInitialized()) {
            return;
        }
        AndroidNativeModule.isLocationEnable(callback);
    }

    static exitApp() {
        if (!checkIfInitialized()) {
            return;
        }
        AndroidNativeModule.exitApp();
    }

    /*static generalSettings() {
        if (!checkIfInitialized()) return;
        try {
            (Platform.OS === 'ios') ? Linking.openURL('App-prefs:') : AndroidNativeModule.generalSettings();
        } catch (err) {
            console.error(err);
        }
    }

    static appSettings() {
        if (!checkIfInitialized()) return;
        try {
            (Platform.OS === 'ios') ?
                Linking.openURL('app-settings:') :
                AndroidNativeModule.appSettings();
        } catch (err) {
            console.error(err);
        }
    }*/

    static locationSettings() {
        try {
            if (Platform.OS === 'ios') {
                Linking.openURL('App-prefs:');
            } else {
                if (!checkIfInitialized()) {
                    return;
                }
                AndroidNativeModule.locationSettings();
            }
        } catch (err) {
            console.error(err);
        }
    }
}
