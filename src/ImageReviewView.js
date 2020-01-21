import React from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    SafeAreaView, BackHandler,
} from 'react-native';
import {NeonHandler} from './NeonHandler';
import ActionBarWrapper from './ActionBarWrapper';
import * as Strings from './values/Strings';
import ViewPager from './viewPager/ViewPager';
import * as Colors from './values/Colors';
import {FileInfo} from './FileInfo';
import index from 'react-native-simple-toast';

let dataSource = new ViewPager.DataSource({
    pageHasChanged: (p1, p2) => p1 !== p2,
});
let self;
let extraData = false;
export default class extends React.PureComponent {
    constructor(props) {
        super(props);
        self = this;
        this.state = {
            data: JSON.parse(JSON.stringify([...NeonHandler.getOptions().selectedImages])),
            selectedIndex: props.navigation.state.params.selectedIndex,
            itemData: props.navigation.state.params.itemData,
            changeType: 0,
            tagList: NeonHandler.getOptions().tagList && NeonHandler.getOptions().tagList.length > 0 ? JSON.parse(JSON.stringify([...NeonHandler.getOptions().tagList])) : [],
            modalVisible: false,
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.prepareTagList();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick = () => {
        this.onBackPress();
        return true;
    };

    prepareTagList = () => {
        if (NeonHandler.getOptions().tagEnabled && NeonHandler.getOptions().tagList) {
            let newTagList = [];
            let tagList = this.state.tagList;
            for (let i = 0; i < tagList.length; i++) {
                let tag = tagList[i];
                tag['selected'] = this.state.data.some(item => item.fileTag && item.fileTag.tagId === tag.tagId);
                newTagList.push(tag);
            }
            this.state.tagList = newTagList;
        }
    };

    changeSelectedIndex = (pageNo) => {
        this.setState({selectedIndex: pageNo, changeType: 0});
    };

    onLeftPress = () => {
        this.setState({
            selectedIndex: this.state.selectedIndex - 1,
            changeType: 1,
        });
    };

    onRightPress = () => {
        this.setState({
            selectedIndex: this.state.selectedIndex + 1,
            changeType: 1,
        });
    };

    onTagPress = () => {
        this.setState({
            modalVisible: true,
        });
    };

    renderPage(item, index) {
        let imageUrl = '';
        if (item.filePath.toString().includes('//')) {
            imageUrl = item.filePath;
        } else {
            imageUrl = 'file://' + item.path;
        }
        return (
            <View style={{flex: 1}}>
                <Image style={{flex: 1, resizeMode: 'contain'}}
                       source={{uri: imageUrl}}/>
            </View>
        );
    }

    onTagItemPress = (item, index) => {
        if (item.numberOfPhotos && item.numberOfPhotos !== 0) {
            let taggedImagesCount = self.state.data.filter(row => row.fileTag && row.fileTag.tagId === item.tagId).length;
            if (taggedImagesCount >= item.numberOfPhotos) {
                return;
            }
        }
        self.state.tagList[index]['selected'] = true;
        self.state.data[this.state.selectedIndex]['fileTag'] = item;
        self.setState({
            modalVisible: false,
        });
        self.rearrangeTagList();
    };

    rearrangeTagList = () => {
        let tagList = this.state.tagList;
        for (let i = 0; i < tagList.length; i++) {
            tagList[i]['selected'] = this.state.data.some(obj => obj.fileTag && obj.fileTag.tagId === tagList[i].tagId);
        }
        this.state.tagList = tagList;
    };

    _onDelete = () => {
        if (this.state.data.length === 1) {
            this.showDeleteAlert();
        } else {
            let selectedIndex = 0;
            if (this.state.selectedIndex === (this.state.data.length - 1)) {
                selectedIndex = this.state.selectedIndex - 1;
            } else {
                selectedIndex = this.state.selectedIndex;
            }
            console.log('before',this.state.data);
            let data = this.state.data.filter((value, index) => index !== this.state.selectedIndex);
            console.log('after',data);
            this.setState({
                selectedIndex: selectedIndex,
                data: data
            })
        }
    };

    showDeleteAlert = () => {
        Alert.alert(NeonHandler.getOptions().deleteImageTitle, '', [
            {
                text: NeonHandler.getOptions().yesLabel,
                onPress: () => {
                    self.state.data = [];
                    self._clickOk();
                },
            }, {
                text: NeonHandler.getOptions().cancelLabel,
                onPress: () => {
                },
            },
        ], {cancelable: false});
    };

    render() {
        extraData = !extraData;
        let data = dataSource.cloneWithPages(this.state.data);
        let selectedFile = this.state.data[this.state.selectedIndex];
        let actionBarProps = {
            values: {title: Strings.IMAGE_REVIEW},
            rightIcons: [
                {
                    image: require('./images/bin.png'),
                    onPress: this._onDelete,
                },
                {
                    image: require('./images/check_box.png'),
                    onPress: this._clickOk,
                },
            ],
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
                    <View style={{flex: 1, backgroundColor: Colors.BLACK, paddingVertical: 10}}>
                        <ViewPager
                            ref={'viewPager'}
                            initialPage={this.state.selectedIndex}
                            dataSource={data}
                            changeType={this.state.changeType}
                            renderPage={this.renderPage}
                            isLoop={false}
                            autoPlay={false}
                            renderPageIndicator={false}
                            onChangePage={this.changeSelectedIndex}
                        />
                        {(this.state.selectedIndex !== 0) && <TouchableOpacity onPress={this.onLeftPress} style={{
                            position: 'absolute',
                            top: (Dimensions.get('window').height - 150) / 2,
                            left: 0,
                            height: 30,
                            width: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Image style={{
                                height: 24,
                                width: 24,
                                tintColor: Colors.WHITE,
                                transform: [{rotate: '180deg'}],
                            }}
                                   source={require('./images/arrow.png')}/>
                        </TouchableOpacity>}
                        {(this.state.selectedIndex !== (self.state.data.length - 1)) &&
                        <TouchableOpacity onPress={this.onRightPress} style={{
                            position: 'absolute',
                            top: (Dimensions.get('window').height - 150) / 2,
                            right: 0,
                            height: 30,
                            width: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Image style={{height: 24, width: 24, tintColor: Colors.WHITE}}
                                   source={require('./images/arrow.png')}/>
                        </TouchableOpacity>}
                    </View>
                    {NeonHandler.getOptions().tagEnabled && <View style={{padding: 10, backgroundColor: Colors.WHITE}}>
                        <TouchableOpacity onPress={this.onTagPress}>
                            <Text style={{
                                fontSize: 16,
                                fontFamily: Strings.APP_FONT,
                            }}>{selectedFile.fileTag && selectedFile.fileTag.tagName ? selectedFile.fileTag.tagName : 'Select Tag'}</Text>
                            <View style={{height: 1, backgroundColor: Colors.BLACK_40, marginTop: 5}}/>
                        </TouchableOpacity>
                    </View>}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisible}>
                        <View style={{flex: 1, justifyContent: 'flex-end'}}>
                            <View style={{
                                backgroundColor: Colors.WHITE,
                                marginHorizontal: 20,
                                marginTop: 56,
                                marginBottom: 50,
                                borderRadius: 3,
                                elevation: 5,
                            }}>
                                <TouchableOpacity onPress={() => this.setState({
                                    modalVisible: false,
                                })} style={{height: 34, width: 34, alignItems: 'center', justifyContent: 'center'}}>
                                    <Image source={require('./images/cancel_icon.png')}
                                           style={{height: 24, width: 24, tintColor: Colors.BLACK_85}}/>
                                </TouchableOpacity>
                                <FlatList
                                    style={{paddingBottom: 5}}
                                    data={this.state.tagList}
                                    renderItem={this._renderTagItem}
                                    keyExtractor={(item) => item.tagId}
                                    extraData={this.state}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>
            </SafeAreaView>
        );
    }

    _renderTagItem = ({item, index}) => {
        return (
            <TouchableOpacity onPress={() => this.onTagItemPress(item, index)}>
                <Text style={{
                    fontSize: 14,
                    padding: 8,
                    backgroundColor: item.selected ? Colors.BLACK_11 : Colors.WHITE,
                    color: Colors.BLACK,
                    fontFamily: Strings.APP_FONT,
                }}>{item.mandatory ? '*' : ''}{item.tagName}</Text>
                <View style={{height: 1, backgroundColor: Colors.BLACK_25}}/>
            </TouchableOpacity>
        );

    };

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    _clickOk = () => {
        NeonHandler.changeSelectedImages(this.state.data);
        if (this.props.navigation.state.params.onDoneFromReview) {
            this.props.navigation.state.params.onDoneFromReview();
            this.props.navigation.goBack();
        }
    };
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        backgroundColor: 'white',
    },
});
