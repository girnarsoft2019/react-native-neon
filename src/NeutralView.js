import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ScrollView,
    FlatList,
    StyleSheet,
    Dimensions,
    BackHandler,
    Alert,
} from 'react-native';
import * as Strings from './values/Strings';
import * as Colors from './values/Colors';
import {NeonHandler} from './NeonHandler';
import PageKeys from './PageKeys';
import ActionBarWrapper from './ActionBarWrapper';
import * as Utility from './Utility';
import Toast from 'react-native-simple-toast';
import * as ImagePicker from './index';

let self;
let edge = (Dimensions.get('window').width) / 3 - 5;
export default class NeutralView extends Component {
    constructor() {
        super();
        self = this;
        edge = (Dimensions.get('window').width) / 3 - 5;
        this.state = {
            data: [...NeonHandler.getOptions().selectedImages]
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick = () => {
        this.onBackPress();
        return true;
    };

    onCameraPress = () => {
        this.props.navigation.navigate(PageKeys.camera, {onDoneFromCamera: this.onDoneFromOtherScreen});
    };

    onGalleryPress = () => {
        this.props.navigation.navigate(PageKeys.album_list, {onDoneFromGallery: this.onDoneFromOtherScreen});
    };

    onDoneFromOtherScreen = () => {
        this.setState({
            data: [...NeonHandler.getOptions().selectedImages],
        });
    };

    onImageCancelPress = (item, index) => {
        console.log(this.state.data);
        let newData = [];
        for (let i = 0; i < this.state.data.length; i++) {
            if (i !== index) {
                newData.push(this.state.data[i]);
            }
        }
        this.setState({
            data: newData,
        });
        NeonHandler.changeSelectedImages(newData);
    };

    onImagePress = (item, index) => {
        this.props.navigation.navigate(PageKeys.image_review, {
            itemData: item,
            selectedIndex: index,
            data: [...NeonHandler.getOptions().selectedImages],
            onDoneFromReview: this.onDoneFromOtherScreen,
        });
    };

    onSubmit = () => {
        let returnData = Utility.checkForMandatoryImagesTaken();
        console.log(returnData);
        if (returnData.status) {
            self.returnDataToApp(false);
        } else {
            returnData.msg && Toast.show(returnData.msg, Toast.SHORT);
        }
    };

    returnDataToApp = (fromBack) => {
        NeonHandler.getOptions().callback && NeonHandler.getOptions().callback(Utility.prepareReturnData(fromBack));
        this.props.navigation.goBack();

    };

    onBackPress = () => {
        if (NeonHandler.getOptions().initialRoute === PageKeys.neutral) {
            Utility.checkForReturn(self.returnDataToApp);
        } else {
            self.returnDataToApp(true);
        }
    };

    _column = () => {
        return 3;
    };


    renderTagOrImage = () => {
        if (!NeonHandler.getOptions().tagEnabled) {
            return this.renderImageView();
        } else {
            if (NeonHandler.getOptions().selectedImages && NeonHandler.getOptions().selectedImages.length > 0) {
                return this.renderImageView();
            } else {
                return this.renderTagView();
            }
        }

    };
    renderTagView = () => {
        return (
            <FlatList
                style={[styles.list]}
                renderItem={this._renderTagItem}
                data={[{}, ...NeonHandler.getOptions().tagList.filter(row => row.mandatory)]}
                keyExtractor={(item, index) => index.toString()}
                extraData={this.state}
            />
        );
    };

    renderImageView = () => {
        return (
            <FlatList
                key={this._column()}
                style={[styles.list]}
                renderItem={this._renderItem}
                data={this.state.data}
                keyExtractor={(item, index) => index.toString()}
                numColumns={this._column()}
                extraData={this.state}
            />
        );
    };

    _renderItem = ({item, index}) => {
        const backgroundColor = NeonHandler.getOptions().colorPrimary;
        return (
            <TouchableOpacity style={{padding: 2.5}} onPress={() => this.onImagePress(item, index)}>
                <Image
                    key={index}
                    source={{uri: item.filePath}}
                    style={{width: edge, height: edge, overflow: 'hidden'}}
                    resizeMode='cover'
                />
                <TouchableOpacity onPress={() => this.onImageCancelPress(item, index)} style={styles.selectView}>
                    <View style={[styles.selectIcon, {backgroundColor}]}>
                        <Image
                            source={require('./images/cancel_icon.png')}
                            style={styles.selectedIcon}
                        />
                    </View>
                </TouchableOpacity>
                {NeonHandler.getOptions().tagEnabled && item.fileTag && item.fileTag.tagName && <View style={{
                    position: 'absolute',
                    left: 2.5,
                    right: 2.5,
                    bottom: 2.5,
                    backgroundColor: Colors.BLACK_40,
                }}>
                    <Text style={{
                        fontFamily: Strings.APP_FONT,
                        fontSize: 12,
                        color: Colors.WHITE,
                        padding: 3,
                    }}>{item.fileTag.tagName}</Text>
                </View>}
            </TouchableOpacity>
        );
    };

    _renderTagItem = ({item, index}) => {
        let text = index === 0 ? Strings.MANDATORY_IMAGES : (Strings.DOT + ' ' + item.tagName);
        let textStyle = index === 0 ? {
            fontSize: 16,
            fontWeight: 'bold',
            color: Colors.BLACK_54,
        } : {
            fontSize: 14,
            color: 'red',
        };
        return (
            <View style={{marginHorizontal: 15}}>
                <Text style={[textStyle, {fontFamily: Strings.APP_FONT}]}>{text}</Text>
            </View>
        );
    };

    render() {
        let actionBarProps = {
            values: {title: NeonHandler.getOptions().neutralTitle},
            rightIcons: [],
            styleAttr: {
                leftIconImage: require('./images/back.png'),
            }
            ,
            actions: {
                onLeftPress: this.onBackPress,
            },
        };
        return (
            <View style={{flex: 1}}>
                <ActionBarWrapper
                    values={actionBarProps.values}
                    actions={actionBarProps.actions}
                    iconMap={actionBarProps.rightIcons}
                    styleAttributes={actionBarProps.styleAttr}/>
                <View style={{flexDirection: 'row', height: 80}}>
                    {NeonHandler.getOptions().showCameraOnNeutral &&
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={this.onCameraPress}
                                          style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image style={{height: 50, width: 50}} source={require('./images/camera_icon.png')}/>
                            <Text style={{fontSize: 16, paddingLeft: 10, color: 'black'}}>{Strings.CAMERA}</Text>
                        </TouchableOpacity>
                    </View>}
                    {NeonHandler.getOptions().showGalleryOnNeutral &&
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity onPress={this.onGalleryPress}
                                          style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image style={{height: 50, width: 50}} source={require('./images/gallery_icon.png')}/>
                            <Text style={{fontSize: 16, paddingLeft: 10, color: 'black'}}>{Strings.GALLERY}</Text>
                        </TouchableOpacity>
                    </View>}
                </View>
                <View style={{height: 1, backgroundColor: Colors.BLACK_25, marginHorizontal: 15, marginBottom: 8}}/>
                <View style={{flex: 1}}>
                    {this.renderTagOrImage()}
                </View>
                <TouchableOpacity onPress={this.onSubmit} style={{
                    height: 48,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: NeonHandler.getOptions().colorPrimary,
                }}>
                    <Text style={{
                        color: Colors.WHITE,
                        fontSize: 16,
                        fontWeight: 'bold',
                        fontFamily: Strings.APP_FONT,
                    }}>SUBMIT</Text>
                </TouchableOpacity>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: 'white',
    },
    safeView: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    selectView: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectIcon: {
        width: 20,
        height: 20,
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    selectedIcon: {
        width: 13,
        height: 13,
        tintColor: 'white',
    },
    bottom: {
        height: 44,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e6e6ea',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e6e6ea',
    },
});