'use strict';
import {NativeModules} from 'react-native';

const AndroidNativeModule = NativeModules.AndroidModule;

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
        AndroidNativeModule.exitApp()
    }

}
