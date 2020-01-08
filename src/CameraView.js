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
            currentTagIndex: 0,
            isLoading: false,
            showPreview: false,
            currentTempFilInfo: undefined,
            moveToNextTag: false,
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (NeonHandler.getOptions().cameraOrientation === ImagePicker.ORIENTATION.LANDSCAPE) {
            Orientation.lockToLandscape();
        } else {
            Orientation.lockToPortrait();
        }
        let destPath = NeonHandler.getOptions().folderName ? RNFS.ExternalStorageDirectoryPath + '/' + NeonHandler.getOptions().appName + '/' + NeonHandler.getOptions().folderName : RNFS.ExternalStorageDirectoryPath + '/' + NeonHandler.getOptions().appName;
        RNFS.mkdir(destPath.toString()).then(() => {

        });

        //String.prototype.format();
        //Dimensions.addEventListener('change', this._onWindowChanged);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Orientation.lockToPortrait();
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
        NeonHandler.getOptions().callback && NeonHandler.getOptions().callback(Utility.prepareReturnData(fromBack));
        self.props.navigation.goBack();

    };

    _clickTakePicture = async () => {
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
                writeExif: {'Make': NeonHandler.getOptions().appName},
                quality: 1,
                ...NeonHandler.getOptions().pictureOptions,
            });
            console.log('from camera', item);
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
            console.log('after resize', filePath, filePath1);
            let destPath = NeonHandler.getOptions().folderName ? RNFS.ExternalStorageDirectoryPath + '/' + NeonHandler.getOptions().appName + '/' + NeonHandler.getOptions().folderName + '/' + filePath1.split('/').pop() : RNFS.ExternalStorageDirectoryPath + '/' + NeonHandler.getOptions().appName + '/' + filePath1.split('/').pop();
            await RNFS.moveFile(filePath, destPath).then(() => {
                fileInfo.filePath = destPath;
                AndroidModule.scanFile(destPath);
            }).catch(() => {
                fileInfo.filePath = filePath;
            });
            if (tagEnabled) {
                fileInfo.fileTag = currentTag;
            }
            fileInfo.filePath = Utility.getUriFromLocalFilePath(fileInfo.filePath);
            fileInfo.source = ImagePicker.IMAGE_SOURCE.CAMERA;
            this.state.currentTempFilInfo = fileInfo;
            this.state.moveToNextTag = tagEnabled && tagCountRestriction && (taggedImagesCount + 1) >= currentTag.numberOfPhotos && moveToNext;
            this.checkForPreview();
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
                width = NeonHandler.getOptions().imageWidth ? NeonHandler.getOptions().imageWidth : 1200;
                height = NeonHandler.getOptions().imageHeight ? NeonHandler.getOptions().imageHeight : 900;
            }
            ImageResizer.createResizedImage(imageUri, width, height, 'JPEG', NeonHandler.getOptions().quality, NeonHandler.getOptions().appName).then((response) => {
                // response.uri is the URI of the new image that can now be displayed, uploaded...
                // response.path is the path of the new image
                // response.name is the name of the new image with the extension
                // response.size is the size of the new image
                console.log('from resize', response);
                resolve(response);
            }).catch((err) => {
                console.log(err);
                resolve(err);
                // Oops, something went wrong. Check that the filename is correct and
                // inspect err to get more details.
            });
        });
    };

    deleteImage = (filePath) => {
        console.log('for delete', filePath);
        RNFS.unlink(filePath).then(result => {
            console.log('image deleted', JSON.stringify(result));
        }).catch(err => {
            console.log(err);
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
                isLoading: false,
                showPreview: false,
                moveToNextTag: false,
            });
        } else {
            this._clickDone(false);
        }

    };

    onPreviousPress = () => {
        this.setState({
            currentTagIndex: this.state.currentTagIndex - 1,
        });
    };

    onCancelPress = () => {
        this.setState({
            showPreview: false,
            isLoading: false,
        });
    };

    onOkPress = () => {
        this.addImage();
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
                        <Text>Saving Image...</Text>
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
                style={NeonHandler.getOptions().cameraOrientation === ImagePicker.ORIENTATION.LANDSCAPE ? styles.flashContainerRight : styles.flashContainerLeft}>
                {NeonHandler.getOptions().flashEnabled && this._renderTopButton(image, this._clickFlashMode)}
                {NeonHandler.getOptions().cameraSwitchEnabled && this._renderTopButton(require('./images/switch_camera.png'), this._clickSwitchSide)}
            </View>
        );
    };

    _renderTagCoachImage = () => {
        if (NeonHandler.getOptions().tagEnabled && NeonHandler.getOptions().tagList && NeonHandler.getOptions().tagList.length > 0 && NeonHandler.getOptions().showTagCoachImage) {
            let tag = NeonHandler.getOptions().tagList[this.state.currentTagIndex];
            let isLandscape = NeonHandler.getOptions().cameraOrientation === ImagePicker.ORIENTATION.LANDSCAPE;
            if (tag.tagPreviewUrl && tag.tagPreviewUrl != '') {
                return (
                    <View style={{
                        position: 'absolute',
                        left: 10,
                        top: 65,
                        height: isLandscape ? 75 : 100,
                        width: isLandscape ? 100 : 75,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 3,
                    }}>
                        <Image resizeMode={'contain'}
                               style={{height: isLandscape ? 75 : 100, width: isLandscape ? 100 : 75}}
                               source={{uri: tag.tagPreviewUrl}}/>
                    </View>
                );
            }
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
                captureAudio={true}
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
