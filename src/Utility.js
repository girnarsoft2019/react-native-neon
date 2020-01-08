import React, {Component} from 'react';
import {Platform, Alert} from 'react-native';
import {NeonHandler} from './NeonHandler';
import * as ImagePicker from './index';

export function checkForMandatoryImagesTaken() {
    if (NeonHandler.getOptions().tagEnabled) {
        let tagList = NeonHandler.getOptions().tagList;
        let selectedImages = NeonHandler.getOptions().selectedImages;
        let isFound = true;
        let currentTag;
        if (selectedImages.some(obj => !obj.fileTag || !obj.fileTag.tagId)) {
            return {
                status: false,
                msg: NeonHandler.getOptions().selectTagForAllImages,
            };
        }
        for (let i = 0; i < tagList.length; i++) {
            if (tagList[i].mandatory) {
                isFound = selectedImages.some(obj => obj.fileTag && obj.fileTag.tagId === tagList[i].tagId);
                currentTag = tagList[i];
                if (!isFound) {
                    break;
                }
            }
        }
        if (isFound) {
            return {
                status: true,
                msg: 'Tags found',
            };
        } else {
            return {
                status: false,
                msg: currentTag.tagName + ' ' + NeonHandler.getOptions().tagNotCovered,
            };
        }
    } else {
        return {
            status: true,
            msg: 'All well',
        };
    }
}

export function checkForReturn(callback) {
    if (NeonHandler.getOptions().libraryMode === ImagePicker.LIBRARY_MODE.HARD) {
        Alert.alert(NeonHandler.getOptions().backAlertTitle, '', [
            {
                text: NeonHandler.getOptions().yesLabel,
                onPress: () => {
                    callback && callback(true);
                },
            }, {
                text: NeonHandler.getOptions().cancelLabel,
                onPress: () => {
                },
            },
        ], {cancelable: true});
    } else {
        callback && callback(true);
    }
}

/*export function checkForBackPressed(page, props, callback) {
    export function checkForReturn(page, props, callback) {
        if(NeonHandler.getOptions().initialRoute === page){
            if (NeonHandler.getOptions().libraryMode === ImagePicker.LIBRARY_MODE.HARD) {
                Alert.alert(NeonHandler.getOptions().backAlertTitle, '', [
                    {
                        text: NeonHandler.getOptions().yesLabel,
                        onPress: () => {
                            callback && callback(true);
                        },
                    }, {
                        text: NeonHandler.getOptions().cancelLabel,
                        onPress: () => {
                        },
                    },
                ], {cancelable: true});
            } else {
                callback && callback(true);
            }
        }else {
            props.navigation.goBack();
        }
    }
}*/

export function prepareReturnData(fromBack) {
    return {
        data: NeonHandler.getOptions().selectedImages,
        responseCode: fromBack ? ImagePicker.RESPONSE_CODE.BACK_PRESSED : ImagePicker.RESPONSE_CODE.SUCCESS,
    };
}

export function returnDataToApp(fromBack, props) {
    NeonHandler.getOptions().callback && NeonHandler.getOptions().callback(prepareReturnData(fromBack));
    props.navigation.goBack();
}


export function formatString() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
}

export function getUriFromLocalFilePath(path) {
    if (path.startsWith('file://')) {
        return path;
    }else {
        return 'file://'+path;
    }

}