import React from 'react';
import {
    Image,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    SafeAreaView,
    BackHandler,
} from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import PageKeys from './PageKeys';
import {NeonHandler} from "./NeonHandler";
import * as Strings from './values/Strings';
import ActionBarWrapper from './ActionBarWrapper';
import * as Utility from './Utility';

let self;
export default class extends React.PureComponent {

    constructor(props) {
        super(props);
        self = this;
        this.state = {
            data: [],
            selectedItems: NeonHandler.getOptions().selectedImages ? [...NeonHandler.getOptions().selectedImages] : [],
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        Dimensions.addEventListener('change', this._onWindowChanged);
        CameraRoll.getPhotos({
            first: 1000000,
            groupTypes: Platform.OS === 'ios' ? NeonHandler.getOptions().groupTypes : undefined,
            assetType: NeonHandler.getOptions().assetType,
        }).then((result) => {
            const arr = result.edges.map(item => item.node);
            const dict = arr.reduce((prv, cur) => {
                const curValue = {
                    type: cur.type,
                    location: cur.location,
                    timestamp: cur.timestamp,
                    ...cur.image,
                };
                if (!prv[cur.group_name]) {
                    prv[cur.group_name] = [curValue];
                } else {
                    prv[cur.group_name].push(curValue);
                }
                return prv;
            }, {});
            const data = Object.keys(dict)
                .sort((a, b) => {
                    const rootIndex = 'Camera Roll';
                    if (a === rootIndex) {
                        return -1;
                    } else if (b === rootIndex) {
                        return 1;
                    } else {
                        return a < b ? -1 : 1;
                    }
                })
                .map(key => ({name: key, value: dict[key]}));
            this.setState({data});
        });
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
        if (NeonHandler.getOptions().initialRoute === PageKeys.album_list) {
            Utility.checkForReturn(self.returnDataToApp);
        } else {
            self.props.navigation.goBack();
        }
    };

    returnDataToApp = (fromBack) => {
        self.props.navigation.goBack();
        NeonHandler.getOptions().callback && NeonHandler.getOptions().callback(Utility.prepareReturnData(fromBack));

    };

    _clickOk = () => {
        NeonHandler.changeSelectedImages(this.state.selectedItems);
        switch (NeonHandler.getOptions().initialRoute) {
            case PageKeys.neutral:
                this.props.navigation.state.params.onDoneFromGallery && this.props.navigation.state.params.onDoneFromGallery();
                this.props.navigation.goBack();
                break;
            case PageKeys.camera:
                break;
            case PageKeys.album_list:
                self.returnDataToApp(false);
                break;
        }
    };

    onCameraPress = () => {

    }

    render() {
        let actionBarProps = {
            values: {title: Strings.GALLERY},
            rightIcons: [{
                image: require('./images/check_box.png'),
                onPress: this._clickOk
            }],
            styleAttr: {
                leftIconImage: require('./images/back.png')
            }
            ,
            actions: {
                onLeftPress: this.onBackPress
            }
        };
        return (
            <SafeAreaView style={{flex:1}}>
                <View style={styles.view}>
                    <ActionBarWrapper
                        values={actionBarProps.values}
                        actions={actionBarProps.actions}
                        iconMap={actionBarProps.rightIcons}
                        styleAttributes={actionBarProps.styleAttr}/>
                    <FlatList
                        style={[styles.listView]}
                        data={this.state.data}
                        renderItem={this._renderItem}
                        keyExtractor={(item) => item.name}
                        extraData={this.state}
                    />
                </View>
            </SafeAreaView>
        );
    }

    _renderItem = ({item}) => {
        const itemUris = new Set(item.value.map(i => i.uri));
        const selectedItems = this.state.selectedItems
            .filter(i => itemUris.has(i.filePath));
        const selectedCount = selectedItems.length;
        return (
            <TouchableOpacity onPress={this._clickRow.bind(this, item)}>
                <View style={styles.cell}>
                    <View style={styles.left}>
                        <Image
                            style={styles.image}
                            source={{uri: item.value[0].uri}}
                            resizeMode='cover'
                        />
                        <Text style={styles.text}>
                            {item.name + ' (' + item.value.length + ')'}
                        </Text>
                    </View>
                    <View style={styles.right}>
                        {selectedCount > 0 && (
                            <Text style={styles.selectedcount}>
                                {'' + selectedCount}
                            </Text>
                        )}
                        <Image
                            source={require('./images/arrow_right.png')}
                            style={styles.arrow}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    _onDoneFromAlbum = (items) => {
        Utility.log(JSON.stringify(items));
        this.setState({selectedItems: [...items]});
    };

    _clickRow = (item) => {
        this.props.navigation.navigate(PageKeys.album_view, {
            ...this.props,
            groupName: item.name,
            photos: item.value,
            onDonePress: this._onDoneFromAlbum,
            selectedItems: this.state.selectedItems
        });
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
    listView: {
        flex: 1,
    },
    cell: {
        height: 60,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e6e6ea',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        overflow: 'hidden',
        width: 44,
        height: 44,
    },
    text: {
        fontSize: 16,
        color: 'black',
        marginLeft: 10,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    selectedcount: {
        width: 18,
        height: 18,
        ...Platform.select({
            ios: {lineHeight: 18},
            android: {textAlignVertical: 'center'},
        }),
        fontSize: 11,
        textAlign: 'center',
        color: 'white',
        backgroundColor: '#e15151',
        borderRadius: 9,
        overflow: 'hidden',
    },
    arrow: {
        width: 13,
        height: 16,
        marginLeft: 10,
        marginRight: 0,
    },
});
