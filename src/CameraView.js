import React, {Component} from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    BackHandler,
    Modal,
    AppState,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {NeonHandler} from './NeonHandler';
import {FileInfo} from './FileInfo';
import PageKeys from './PageKeys';
import * as Colors from './values/Colors';
import Toast from 'react-native-simple-toast';
import Orientation from 'react-native-orientation';
import * as ImagePicker from './index';
import * as RNFS from 'react-native-fs';
import AndroidModule from './AndroidModule';
import * as Utility from './Utility';
import ImageResizer from 'react-native-image-resizer';
import Geolocation, {PositionError} from 'react-native-geolocation-service';

let self;
export default class CameraView extends Component {

    constructor(props) {
        super(props);
        self = this;
        this.flashModes = [
            RNCamera.Constants.FlashMode.auto,
            RNCamera.Constants.FlashMode.on,
            RNCamera.Constants.FlashMode.off,
        ];
        this.state = {
            data: [...NeonHandler.getOptions().selectedImages],
            sideType: NeonHandler.getOptions().sideType === ImagePicker.CAMERA_TYPE.REAR ? RNCamera.Constants.Type.back : RNCamera.Constants.Type.front,
            flashMode: this.flashModes[NeonHandler.getOptions().flashMode],
            isRecording: false,
            appState: AppState.currentState,
            currentTagIndex: 0,
            isLoading: false,
            showPreview: false,
            currentTempFilInfo: undefined,
            moveToNextTag: false,
            settingsActive: false,
        };
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/active/)) {
            Utility.log('App is in background');
        }
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            if (this.state.settingsActive) {
                this.checkForLocationRestriction();
                this.state.settingsActive = false;
            }
            Utility.log('App has come to the foreground!');
        }
        this.state.appState = nextAppState;
    };

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (NeonHandler.getOptions().cameraOrientation === ImagePicker.ORIENTATION.LANDSCAPE) {
            Orientation.lockToLandscape();
        } else {
            Orientation.lockToPortrait();
        }
        let destPath = NeonHandler.getOptions().folderName ? RNFS.ExternalStorageDirectoryPath + '/' + NeonHandler.getOptions().appName.replace(/ /g, '') + '/' + NeonHandler.getOptions().folderName.replace(/ /g, '') : RNFS.ExternalStorageDirectoryPath + '/' + NeonHandler.getOptions().appName.replace(/ /g, '');
        RNFS.mkdir(destPath.toString()).then(() => {

        });
        this.changeActiveIndexOfTag();
        this.checkForLocationRestriction();
    }

    checkForLocationRestriction = () => {
        if (NeonHandler.getOptions().locationRestrictive) {
            this.getLocation();
        }
    };

    getLocation = async () => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (position || position.coords || position.coords.latitude || position.coords.longitude) {
                    self.location = position;
                }
                Utility.log(position);
                self.getLocationUpdates();
            },
            (error) => {
                self.handleLocationError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 50,
                forceRequestLocation: true,
            },
        );
    };

    handleLocationError = (error) => {
        if (error.code) {
            switch (error.code) {
                case PositionError.POSITION_UNAVAILABLE:
                    self.openLocationSettingDialog();
                    break;
                case PositionError.SETTINGS_NOT_SATISFIED:
                    self.openLocationSettingDialog();
                    break;
                default:

            }
        }
        Utility.log(error);
    };

    openLocationSettingDialog() {
        Alert.alert(NeonHandler.getOptions().enableLocationTitle, NeonHandler.getOptions().enableLocationMsg, [
            {
                text: NeonHandler.getOptions().openSettings,
                onPress: () => self.openLocationSetting(),
            },
        ], {cancelable: true});

    }

    openLocationSetting = () => {
        this.state.settingsActive = true;
        Utility.openLocationSetting();
    };

    getLocationUpdates = async () => {
        this.watchId = Geolocation.watchPosition(
            (position) => {
                if (position || position.coords || position.coords.latitude || position.coords.longitude) {
                    self.location = position;
                }
                Utility.log(position);
            },
            (error) => {
                Utility.log(error);
            },
            {enableHighAccuracy: true, distanceFilter: 0, interval: 5000, fastestInterval: 2000},
        );
    };

    removeLocationUpdates = () => {
        if (this.watchId !== null) {
            Geolocation.clearWatch(this.watchId);
        }
    };

    changeActiveIndexOfTag = () => {
        if (NeonHandler.getOptions().selectedImages && NeonHandler.getOptions().selectedImages.length > 0 && NeonHandler.getOptions().tagEnabled && NeonHandler.getOptions().tagList && NeonHandler.getOptions().tagList.length > 0) {
            let tagList = NeonHandler.getOptions().tagList;
            let images = NeonHandler.getOptions().selectedImages;
            for (let i = 0; i < tagList.length; i++) {
                if (tagList[i].mandatory) {
                    if (!images.some(item => item.fileTag && item.fileTag.tagId && item.fileTag.tagId == tagList[i].tagId)) {
                        self.setState({currentTagIndex: i});
                        break;
                    }
                }
            }
        }
    };

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Orientation.lockToPortrait();
        this.removeLocationUpdates();
        //Dimensions.removeEventListener('change', this._onWindowChanged);
    }

    handleBackButtonClick = () => {
        this.onBackPress();
        return true;
    };

    onBackPress = () => {
        if (NeonHandler.getOptions().initialRoute === PageKeys.camera) {
            Utility.checkForReturn(self.returnDataToApp);
        } else {
            self._clickDone(true);
        }
    };

    returnDataToApp = (fromBack) => {
        self.props.navigation.goBack();
        NeonHandler.getOptions().callback && NeonHandler.getOptions().callback(Utility.prepareReturnData(fromBack));

    };

    _clickTakePicture = async () => {
        if (NeonHandler.getOptions().locationRestrictive) {
            if (!self.location || !self.location.coords || !self.location.coords.latitude || !self.location.coords.longitude) {
                Toast.show(NeonHandler.getOptions().fetchingLocationMsg, Toast.SHORT);
                self.getLocation();
                return;
            }
        }
        this.setState({isLoading: true});
        let tagEnabled = false;
        let currentTag = undefined;
        let tagCountRestriction = false;
        let taggedImagesCount = 0;
        let moveToNext = false;
        if (NeonHandler.getOptions().maxSize > 0 && NeonHandler.getOptions().selectedImages.length >= NeonHandler.getOptions().maxSize) {
            this.setState({isLoading: false});
            Toast.show(NeonHandler.getOptions().maxSizeTakeAlert(NeonHandler.getOptions().maxSize), Toast.SHORT);
            return;
        } else if (NeonHandler.getOptions().tagEnabled && NeonHandler.getOptions().tagList && NeonHandler.getOptions().tagList.length > 0) {
            tagEnabled = true;
            currentTag = NeonHandler.getOptions().tagList[this.state.currentTagIndex];
            moveToNext = (NeonHandler.getOptions().tagList.length - 1) !== this.state.currentTagIndex;
            if (currentTag.numberOfPhotos && currentTag.numberOfPhotos !== 0) {
                tagCountRestriction = true;
                taggedImagesCount = NeonHandler.getOptions().selectedImages.filter(item => item.fileTag && item.fileTag.tagId === currentTag.tagId).length;
                if (taggedImagesCount >= currentTag.numberOfPhotos) {
                    this.setState({isLoading: false});
                    Toast.show(NeonHandler.getOptions().maxSizeForTagTakeAlert(currentTag.tagName, currentTag.numberOfPhotos), Toast.SHORT);
                    return;
                }
            }
        }
        let fileInfo = {...FileInfo};
        if (this.camera) {
            const item = await this.camera.takePictureAsync({
                mirrorImage: this.state.sideType === RNCamera.Constants.Type.front,
                fixOrientation: true,
                forceUpOrientation: true,
                captureTarget: '1',
                writeExif: {'Make': NeonHandler.getOptions().appName.replace(/ /g, '')},
                quality: 1,
                ...NeonHandler.getOptions().pictureOptions,
            });
            Utility.log('from camera', item);
            /*if (Platform.OS === 'ios') {
                if (item.uri.startsWith('file://')) {
                    item.uri = item.uri.substring(7);
                }
            }*/
            let filePath = item.uri;
            let filePath1 = item.uri;
            let resizeResponse = await self.resizeImage(filePath);
            if (resizeResponse && resizeResponse.uri) {
                self.deleteImage(filePath);
                filePath = resizeResponse.uri;
                filePath1 = resizeResponse.uri;
            }
            Utility.log('after resize', filePath, filePath1);
            let destPath = NeonHandler.getOptions().folderName ? RNFS.ExternalStorageDirectoryPath + '/' + NeonHandler.getOptions().appName.replace(/ /g, '') + '/' + NeonHandler.getOptions().folderName.replace(/ /g, '') + '/' + filePath1.split('/').pop() : RNFS.ExternalStorageDirectoryPath + '/' + NeonHandler.getOptions().appName.replace(/ /g, '') + '/' + filePath1.split('/').pop();
            Utility.log('destination path', destPath)
            await RNFS.moveFile(filePath, destPath).then(() => {
                fileInfo.filePath = destPath;
                AndroidModule.scanFile(destPath);
            }).catch((error) => {
                fileInfo.filePath = filePath;
                console.warn(error)
            });
            if (tagEnabled) {
                fileInfo.fileTag = currentTag;
            }
            fileInfo.timestamp = new Date().getTime();
            fileInfo.filePath = Utility.getUriFromLocalFilePath(fileInfo.filePath);
            fileInfo.source = ImagePicker.IMAGE_SOURCE.CAMERA;
            fileInfo.fileName = fileInfo.filePath.substring(fileInfo.filePath.lastIndexOf('/') + 1);
            if (NeonHandler.getOptions().locationRestrictive) {
                fileInfo.latitude = self.location.coords.latitude;
                fileInfo.longitude = self.location.coords.longitude;
            }
            let data = [...NeonHandler.getOptions().selectedImages, fileInfo];
            NeonHandler.changeSelectedImages(data);
            this.setState({isLoading: false, currentTempFilInfo: fileInfo});
            //this.state.currentTempFilInfo = fileInfo;
            //this.state.moveToNextTag = tagEnabled && tagCountRestriction && (taggedImagesCount + 1) >= currentTag.numberOfPhotos && moveToNext;
            //this.checkForPreview();
            /*if (tagEnabled && tagCountRestriction && (taggedImagesCount + 1) >= currentTag.numberOfPhotos) {
                this.onNextPress(moveToNext);
            } else {
                this.setState({isLoading: false});
            }*/
        }
    };

    checkForPreview = () => {
        if (NeonHandler.getOptions().showPreviewOnCamera) {
            this.setState({
                showPreview: true,
                isLoading: false,
            });
        } else {
            this.addImage();
        }
    };

    addImage = () => {
        let data = [...NeonHandler.getOptions().selectedImages, this.state.currentTempFilInfo];
        NeonHandler.changeSelectedImages(data);
        if (this.state.moveToNextTag) {
            this.onNextPress(true);
        } else {
            this.setState({
                showPreview: false,
                isLoading: false,
            });
        }
    };

    resizeImage = async (imageUri) => {
        return new Promise((resolve) => {
            let height;
            let width;
            if (NeonHandler.getOptions().cameraOrientation === ImagePicker.ORIENTATION.LANDSCAPE) {
                width = NeonHandler.getOptions().imageWidth ? NeonHandler.getOptions().imageWidth : 1200;
                height = NeonHandler.getOptions().imageHeight ? NeonHandler.getOptions().imageHeight : 900;
            } else {
                width = NeonHandler.getOptions().imageWidth ? NeonHandler.getOptions().imageWidth : 900;
                height = NeonHandler.getOptions().imageHeight ? NeonHandler.getOptions().imageHeight : 1200;
            }
            ImageResizer.createResizedImage(imageUri, width, height, 'JPEG', NeonHandler.getOptions().quality, NeonHandler.getOptions().appName.replace(/ /g, '')).then((response) => {
                // response.uri is the URI of the new image that can now be displayed, uploaded...
                // response.path is the path of the new image
                // response.name is the name of the new image with the extension
                // response.size is the size of the new image
                Utility.log('from resize', response);
                resolve(response);
            }).catch((err) => {
                Utility.log(err);
                resolve(undefined);
                // Oops, something went wrong. Check that the filename is correct and
                // inspect err to get more details.
            });
        });
    };

    deleteImage = (filePath) => {
        Utility.log('for delete', filePath);
        RNFS.unlink(filePath).then(result => {
            Utility.log('image deleted', JSON.stringify(result));
        }).catch(err => {
            Utility.log(err);
        });
    };

    _clickSwitchSide = () => {
        const target = this.state.sideType === RNCamera.Constants.Type.back
            ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back;
        this.setState({sideType: target});
    };

    _clickFlashMode = () => {
        let newIndex = this.flashModes.indexOf(this.state.flashMode);
        if (newIndex === 2) {
            newIndex = 0;
        } else {
            newIndex = newIndex + 1;
        }
        this.setState({flashMode: this.flashModes[newIndex]});
    };

    _clickDone = (fromBack) => {
        switch (NeonHandler.getOptions().initialRoute) {
            case PageKeys.neutral:
                this.props.navigation.state.params.onDoneFromCamera && this.props.navigation.state.params.onDoneFromCamera();
                this.props.navigation.goBack();
                break;
            case PageKeys.camera:
                self.returnDataToApp(fromBack);
                break;
            case PageKeys.album_list:
                this.props.navigation.state.params.onDoneFromCamera && this.props.navigation.state.params.onDoneFromCamera();
                this.props.navigation.goBack();
                break;
        }
    };

    _onWindowChanged = () => {
        this.forceUpdate();
    };

    onNextPress = (next) => {
        if (next) {
            this.setState({
                currentTagIndex: this.state.currentTagIndex + 1,
                currentTempFilInfo: undefined,
            });
        } else {
            this._clickDone(false);
        }
    };

    onPreviousPress = () => {
        this.setState({
            currentTagIndex: this.state.currentTagIndex - 1,
            currentTempFilInfo: undefined,
        });
    };

    onCancelPress = () => {
        NeonHandler.deleteLastImage();
        this.setState({
            showPreview: false,
            currentTempFilInfo: undefined,
        });
    };

    onOkPress = () => {
        this.setState({
            showPreview: false,
        });
    };

    render() {
        return (
            <View style={styles.container}>
                <StatusBar hidden={true}/>
                {this._renderCameraView()}
                {this._renderTagView()}
                {this._renderFlashView()}
                {this._renderTagCoachImage()}
                {this._renderBottomView()}
                {this.state.isLoading && <View style={{
                    elevation: 5,
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    position: 'absolute',
                    backgroundColor: Colors.BLACK_40,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <View style={{padding: 20, backgroundColor: Colors.WHITE, alignItems: 'center', borderRadius: 5}}>
                        <ActivityIndicator size="large" color={NeonHandler.getOptions().colorPrimary}
                                           visible={this.state.isLoading}/>
                        <Text>{NeonHandler.getOptions().savingImage}</Text>
                    </View>
                </View>}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.showPreview}
                    style={{flex: 1}}>
                    {this._renderPreviewView()}
                </Modal>
            </View>
        );
    }

    _renderFlashView = () => {
        const {flashMode} = this.state;
        let image;
        switch (flashMode) {
            case RNCamera.Constants.FlashMode.off:
                image = require('./images/flash_close.png');
                break;
            case RNCamera.Constants.FlashMode.on:
                image = require('./images/flash_open.png');
                break;
            case RNCamera.Constants.FlashMode.auto:
                image = require('./images/flash_auto.png');
                break;
            default:
                image = require('./images/flash_auto.png');
        }
        return (
            <View
                style={NeonHandler.getOptions().cameraOrientation === ImagePicker.ORIENTATION.LANDSCAPE ? styles.flashContainerRight : styles.flashContainerRight}>
                {NeonHandler.getOptions().flashEnabled && this._renderTopButton(image, this._clickFlashMode)}
                {NeonHandler.getOptions().cameraSwitchEnabled && this._renderTopButton(require('./images/switch_camera.png'), this._clickSwitchSide)}
            </View>
        );
    };

    _renderTagCoachImage = () => {
        let isLandscape = NeonHandler.getOptions().cameraOrientation === ImagePicker.ORIENTATION.LANDSCAPE;
        let height = isLandscape ? 75 : 100;
        let width = isLandscape ? 100 : 75;
        let tag = undefined;
        if (NeonHandler.getOptions().tagEnabled && NeonHandler.getOptions().tagList && NeonHandler.getOptions().tagList.length > 0 && NeonHandler.getOptions().showTagCoachImage) {
            if (NeonHandler.getOptions().tagList[this.state.currentTagIndex].tagPreviewUrl && NeonHandler.getOptions().tagList[this.state.currentTagIndex].tagPreviewUrl != '') {
                tag = NeonHandler.getOptions().tagList[this.state.currentTagIndex];
            } else {
                tag = undefined;
            }
        }
        return (
            <View style={{
                position: 'absolute',
                left: 10,
                top: 65,
                width: width,
                elevation: 3,
            }}>
                {tag && <View style={{
                    height: height,
                    width: width,
                }}>
                    <Image resizeMode={'contain'}
                           style={{height: isLandscape ? 75 : 100, width: isLandscape ? 100 : 75}}
                           source={{uri: tag.tagPreviewUrl}}/>
                </View>}
                {this._renderPreviewThumbnail(height, width)}
            </View>
        );
    };

    _renderPreviewThumbnail = (height, width) => {
        if (NeonHandler.getOptions().showPreviewOnCamera && this.state.currentTempFilInfo) {
            return (
                <TouchableOpacity onPress={() => {
                    self.setState({
                        showPreview: true,
                    });
                }} style={{
                    height: height,
                    width: width,
                }}>
                    <Image resizeMode={'contain'}
                           style={{height: height, width: width}}
                           source={{uri: this.state.currentTempFilInfo.filePath}}/>
                </TouchableOpacity>
            );
        }
    };

    _renderTagView = () => {
        if (NeonHandler.getOptions().tagEnabled && NeonHandler.getOptions().tagList && NeonHandler.getOptions().tagList.length > 0) {
            let tag = NeonHandler.getOptions().tagList[this.state.currentTagIndex];
            let showNext = (NeonHandler.getOptions().tagList.length > 1) && (this.state.currentTagIndex !== (NeonHandler.getOptions().tagList.length - 1));
            let showPrevious = (this.state.currentTagIndex !== 0) && (NeonHandler.getOptions().tagList.length > 1);
            let mandatory = tag.mandatory;
            return (
                <View style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 15,
                    height: 44,
                    flexDirection: 'row',
                    alignItems: 'center',
                    elevation: 2,
                }}>
                    {showPrevious && <TouchableOpacity onPress={this.onPreviousPress} style={{
                        marginHorizontal: 10,
                        backgroundColor: 'black',
                        height: 44,
                        width: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                    }}>
                        <Image style={{height: 24, width: 24, transform: [{rotate: '180deg'}]}}
                               source={require('./images/arrow.png')}/>
                    </TouchableOpacity>}
                    {<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: mandatory ? 'red' : 'white'}}>{mandatory ? '*' : ''}{tag.tagName}</Text>
                    </View>}
                    {<TouchableOpacity onPress={() => this.onNextPress(showNext)} style={{
                        marginHorizontal: 10,
                        backgroundColor: 'black',
                        height: 44,
                        width: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                    }}>
                        <Image style={{height: 24, width: 24}}
                               source={showNext ? require('./images/arrow.png') : require('./images/check_box.png')}/>
                    </TouchableOpacity>}
                </View>
            );
        }
    };

    _renderTopButton = (image, onPress) => {
        return (
            <TouchableOpacity onPress={onPress}>
                <Image style={styles.topImage} source={image}/>
            </TouchableOpacity>
        );
    };

    _renderCameraView = () => {
        return (
            <RNCamera
                ref={cam => this.camera = cam}
                type={this.state.sideType}
                flashMode={this.state.flashMode}
                style={styles.camera}
                captureAudio={false}
                fixOrientation={true}
            />
        );
    };

    _renderBottomView = () => {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {this._renderBottomButton(NeonHandler.getOptions().doneLabel, self._clickDone)}
                {this._renderTakePhotoButton()}
                {this._renderGalleryButton()}
            </View>
        );
    };

    _renderGalleryButton = (onPress) => {
        return (
            <View style={{marginHorizontal: 10, height: 44, width: 44, alignItems: 'center', justifyContent: 'center'}}>
                {NeonHandler.getOptions().cameraToGallerySwitch && <TouchableOpacity onPress={onPress} style={{
                    height: 44,
                    width: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image style={{height: 44, width: 44, borderRadius: 22}} resizeMode={'cover'}
                           source={require('./images/gallery_icon.png')}/>
                </TouchableOpacity>}
            </View>

        );
    };

    _renderBottomButton = (text, onPress) => {
        return (
            <TouchableOpacity onPress={() => onPress(false)} style={{
                marginHorizontal: 10,
                backgroundColor: 'black',
                height: 44,
                width: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
            }}>
                <Image style={{height: 24, width: 24}} source={require('./images/check_box.png')}/>
            </TouchableOpacity>
        );
    };

    _renderTakePhotoButton = () => {
        const icon = require('./images/shutter.png');
        return (
            <TouchableOpacity
                onPress={this._clickTakePicture}
                style={[styles.takeView]}
            >
                <Image style={styles.takeImage} source={icon}/>
            </TouchableOpacity>
        );
    };

    _renderPreviewView = () => {
        return (<View style={{flex: 1, backgroundColor: Colors.BLACK}}>
            {this.state.currentTempFilInfo &&
            <Image resizeMode={'contain'} style={{height: '100%', width: '100%'}}
                   source={{uri: this.state.currentTempFilInfo.filePath}}/>}
            <View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 15,
                height: 44,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                elevation: 2,
            }}>
                <TouchableOpacity onPress={this.onCancelPress} style={{
                    marginHorizontal: 10,
                    backgroundColor: 'black',
                    height: 44,
                    width: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                }}>
                    <Image style={{height: 24, width: 24}}
                           source={require('./images/cancel_icon.png')}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={this.onOkPress} style={{
                    marginHorizontal: 10,
                    backgroundColor: 'black',
                    height: 44,
                    width: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                }}>
                    <Image style={{height: 24, width: 24}}
                           source={require('./images/check_box.png')}/>
                </TouchableOpacity>
            </View>
        </View>);
    };
}

const topHeight = 60;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    top: {
        position: 'absolute',
        height: topHeight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: 5,
    },
    topImage: {
        margin: 10,
        width: 27,
        height: 27,
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bottom: {
        position: 'absolute',
        height: 84,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    takeView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    takeImage: {
        width: 64,
        height: 64,
        margin: 10,
    },
    buttonTouch: {
        marginHorizontal: 5,
    },
    buttonText: {
        margin: 10,
        height: 44,
        lineHeight: 44,
        fontSize: 16,
        color: 'white',
        backgroundColor: 'transparent',
    },
    flashContainerLeft: {
        position: 'absolute',
        left: 0,
        top: 70,
        bottom: 100,
        width: 44,
        alignItems: 'center',
        elevation: 2,
        justifyContent: 'center',
    },
    flashContainerRight: {
        position: 'absolute',
        right: 0,
        top: 70,
        bottom: 100,
        width: 44,
        alignItems: 'center',
        elevation: 2,
        justifyContent: 'center',
    },
});
