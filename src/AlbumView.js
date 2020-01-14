import React from 'react';
import {
    Alert, BackHandler,
    Dimensions,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {NeonHandler} from './NeonHandler';
import ActionBarWrapper from './ActionBarWrapper';
import {FileInfo} from './FileInfo';
import Toast from 'react-native-simple-toast';
import * as ImagePicker from './index';
import Exif from 'react-native-exif'

let self;
export default class extends React.PureComponent {
    constructor(props) {
        super(props);
        self = this;
        this.state = {
            selectedItems: JSON.parse(JSON.stringify(props.navigation.state.params.selectedItems)),
            changedImages: [],
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        Dimensions.addEventListener('change', this._onWindowChanged);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Dimensions.removeEventListener('change', this._onWindowChanged);
    }

    handleBackButtonClick = () => {
        this.onBackPress();
        return true;
    };

    onBackPress = () => {
        /*if (this.state.selectedItems.length === NeonHandler.getOptions().selectedImages.length) {
            if (this.state.changedImages.length !== 0) {
                this.showBackAlert();
                return;
            }
        } else {
            this.showBackAlert();
            return;
        }*/
        this.props.navigation.goBack();
    };

    showBackAlert = () => {
        Alert.alert(NeonHandler.getOptions().galleryBackAlertTitle, '', [
            {
                text: NeonHandler.getOptions().yesLabel,
                onPress: () => {
                    self.props.navigation.goBack();
                },
            }, {
                text: NeonHandler.getOptions().cancelLabel,
                onPress: () => {
                },
            },
        ], {cancelable: true});
    };

    render() {
        let actionBarProps = {
            values: {title: this.props.navigation.state.params.groupName},
            rightIcons: [{
                image: require('./images/check_box.png'),
                onPress: this._clickOk,
            }],
            styleAttr: {
                leftIconImage: require('./images/back.png'),
            }
            ,
            actions: {
                onLeftPress: this.onBackPress,
            },
        };
        return (
            <SafeAreaView style={{flex: 1}}>
                <View style={styles.view}>
                    <ActionBarWrapper
                        values={actionBarProps.values}
                        actions={actionBarProps.actions}
                        iconMap={actionBarProps.rightIcons}
                        styleAttributes={actionBarProps.styleAttr}/>
                    <FlatList
                        key={this._column()}
                        style={[styles.list]}
                        renderItem={this._renderItem}
                        data={this.props.navigation.state.params.photos}
                        keyExtractor={item => item.uri}
                        numColumns={this._column()}
                        extraData={this.state}
                    />
                </View>
            </SafeAreaView>
        );
    }

    _renderItem = ({item, index}) => {
        const edge = (Dimensions.get('window').width) / this._column() - 2;
        const isSelected = this.state.selectedItems.some(obj => obj.filePath === item.uri);
        const backgroundColor = isSelected ? NeonHandler.getOptions().colorPrimary : 'transparent';
        return (
            <TouchableOpacity onPress={this._clickCell.bind(this, item)}>
                <View style={{padding: 1}}>
                    <Image
                        key={index}
                        source={{uri: item.uri}}
                        style={{width: edge, height: edge, overflow: 'hidden'}}
                        resizeMode='cover'
                    />
                    {isSelected && <View style={styles.selectView}>
                        <View style={[styles.selectIcon, {backgroundColor}]}>
                            <Image
                                source={require('./images/check_box.png')}
                                style={styles.selectedIcon}
                            />
                        </View>
                    </View>}
                </View>
            </TouchableOpacity>
        );
    };

    removeFromChangedImages = (itemuri) => {
        let changedImages = this.state.changedImages.filter(item => item.filePath !== itemuri.uri);
        this.state.changedImages = [...changedImages];
    };

    _clickCell = async (itemuri) => {
        const isSelected = this.state.selectedItems.some(item => item.filePath === itemuri.uri);
        if (isSelected) {
            const selectedItems = this.state.selectedItems.filter(item => item.filePath !== itemuri.uri);
            this.setState({
                selectedItems: [...selectedItems],
            });
            this.removeFromChangedImages(itemuri);
        } else if (NeonHandler.getOptions().maxSize !== 0 && this.state.selectedItems.length >= NeonHandler.getOptions().maxSize) {
            Toast.show(NeonHandler.getOptions().maxSizeChooseAlert(NeonHandler.getOptions().maxSize), Toast.SHORT);
        } else {
            let allowed = true;
            if (NeonHandler.getOptions().folderRestriction) {
                await Exif.getExif(itemuri.uri).then(data => {
                    console.log(JSON.stringify(data));
                    allowed = data.exif && data.exif.Make && data.exif.Make == NeonHandler.getOptions().appName;
                }).catch(error => {
                    allowed = false
                })
            }
            if(allowed){
                let fileInfo = {...FileInfo};
                fileInfo.filePath = itemuri.uri;
                fileInfo.source = ImagePicker.IMAGE_SOURCE.GALLERY;
                fileInfo.timestamp = new Date().getTime();
                fileInfo.fileName = fileInfo.filePath.substring(fileInfo.filePath.lastIndexOf('/') + 1);
                this.setState({
                    selectedItems: [...this.state.selectedItems, fileInfo],
                    changedImages: [...this.state.changedImages, fileInfo],
                });
            }else {
                Toast.show(NeonHandler.getOptions().folderRestrictionErrorMsg, Toast.SHORT);
            }

        }
    };

    _clickOk = () => {
        if (this.props.navigation.state.params.onDonePress) {
            this.props.navigation.state.params.onDonePress(this.state.selectedItems);
            this.props.navigation.goBack();
        }
    };

    _column = () => {
        return 3;
    };

    _onWindowChanged = () => {
        this.forceUpdate();
    };
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
        top: 4,
        right: 4,
        width: 30,
        height: 30,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    selectIcon: {
        marginTop: 2,
        marginRight: 2,
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
