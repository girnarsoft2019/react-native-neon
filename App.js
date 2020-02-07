/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity, ScrollView, Image
} from 'react-native';
import * as ImagePicker from './src/index';

class App extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
            response: ''
        }
    }
    componentDidMount() {
        console.log('componentDidMount');
    }

    onImageCollection = (data) => {
        console.log('Data------------->',data);
        this.setState({data: data.data, response: JSON.stringify(data)});
        this.state.data = data.data
    };

    openCameraFront = () => {
        ImagePicker.openCamera(this.props.navigation,{
            resultRoute: 'app',
            alreadyAddedImages: this.state.data,
            tagEnabled: false,
            cameraOrientation: ImagePicker.ORIENTATION.PORTRAIT,
            sideType: ImagePicker.CAMERA_TYPE.FRONT,
            cameraSwitchEnabled: false,
            flashEnabled: false,
            folderName: 'ABC123',
            showPreviewOnCamera: false
        },this.onImageCollection);
    };

    openCamera = () => {
        ImagePicker.openCamera(this.props.navigation,{
            resultRoute: 'app',
            alreadyAddedImages: this.state.data,
            tagEnabled: false,
            folderName: 'ABC123',
            showPreviewOnCamera: false,
            locationRestrictive: true,
            tagList: [{tagName: 'abc', mandatory: true, tagId:1, numberOfPhotos: 1},{tagName: 'abcd', tagId:2, numberOfPhotos: 1},{tagName: 'abcde',mandatory: true, tagId:3, numberOfPhotos: 1},{tagName: 'abcdef', tagId: 4, numberOfPhotos: 1}]
        },this.onImageCollection);
    };

    openCameraHz = () => {
        ImagePicker.openCamera(this.props.navigation,{
            resultRoute: 'app',
            alreadyAddedImages: this.state.data,
            tagEnabled: false,
            cameraOrientation: ImagePicker.ORIENTATION.LANDSCAPE,
            folderName: 'ABC123',
            showPreviewOnCamera: true,
            tagList: [{tagName: 'abc', mandatory: true, tagId:1, numberOfPhotos: 1},{tagName: 'abcd', tagId:2, numberOfPhotos: 1},{tagName: 'abcde',mandatory: true, tagId:3, numberOfPhotos: 1},{tagName: 'abcdef', tagId: 4, numberOfPhotos: 1}]
        },this.onImageCollection);
    };

    openGallery = () => {
        ImagePicker.openGallery(this.props.navigation,{
            resultRoute: 'app',
            alreadyAddedImages: this.state.data,
            tagEnabled: false,
            tagList: [{tagName: 'abc', mandatory: true, tagId:1},{tagName: 'abcd', tagId:2},{tagName: 'abcde',mandatory: true, tagId:3},{tagName: 'abcdef', tagId: 4}]
        }, this.onImageCollection);
    };

    openNeutralTag = () => {
        ImagePicker.openNeutral(this.props.navigation,{
            resultRoute: 'app',
            alreadyAddedImages: this.state.data,
            tagEnabled: true,
            showTagCoachImage: true,
            showPreviewOnCamera: true,
            cameraOrientation: ImagePicker.ORIENTATION.PORTRAIT,
            tagList: [{tagName: 'abc', mandatory: true, tagId:1, numberOfPhotos: 1, tagPreviewUrl: 'https://www.beamng.com/attachments/20190126211632_1-jpg.517392/'},{tagName: 'abcd', tagId:2},{tagName: 'abcde',mandatory: true, tagId:3},{tagName: 'abcdef', tagId: 4, tagPreviewUrl: 'https://www.beamng.com/attachments/20190126211632_1-jpg.517392/'}]
        },this.onImageCollection);
    };

    openNeutral = () => {
        ImagePicker.openNeutral(this.props.navigation,{
            resultRoute: 'app',
            alreadyAddedImages: this.state.data,
            tagEnabled: false,
            showTagCoachImage: false,
            showPreviewOnCamera: false,
            cameraOrientation: ImagePicker.ORIENTATION.PORTRAIT
        }, this.onImageCollection);
    };

    render() {
        console.log('render');
        return (
            <View style={{backgroundColor: 'white', flex: 1}}>
                <TouchableOpacity
                    style={{marginTop: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green'}}
                    onPress={() => this.openGallery()}>
                    <Text style={{padding: 12, color: 'white'}}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green'}}
                    onPress={() => this.openCameraFront()}>
                    <Text style={{padding: 12, color: 'white'}}>Camera Front</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green'}}
                    onPress={() => this.openCamera()}>
                    <Text style={{padding: 12, color: 'white'}}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green'}}
                    onPress={() => this.openCameraHz()}>
                    <Text style={{padding: 12, color: 'white'}}>Camera Hz</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green'}}
                    onPress={() => this.openNeutralTag()}>
                    <Text style={{padding: 12, color: 'white'}}>Neutral(Tag)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: 'green'}}
                    onPress={() => this.openNeutral()}>
                    <Text style={{padding: 12, color: 'white'}}>Neutral</Text>
                </TouchableOpacity>
                {<ScrollView>
                    <Text>{this.state.response}</Text>
                </ScrollView>}
            </View>
        );
    }

}

export default App;
/*import React, {Component} from 'react';
import ReactNative from 'react-native';

const {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Animated
} = ReactNative;


var isHidden = true;

export default class AppContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bounceValue: new Animated.Value(100),  //This is the initial position of the subview
            buttonText: "Show Subview"
        };
    }


    _toggleSubview() {
        this.setState({
            buttonText: !isHidden ? "Show Subview" : "Hide Subview"
        });

        var toValue = 100;

        if(isHidden) {
            toValue = 0;
        }

        //This will animate the transalteY of the subview between 0 & 100 depending on its current state
        //100 comes from the style below, which is the height of the subview.
        Animated.spring(
            this.state.bounceValue,
            {
                toValue: toValue,
                velocity: 3,
                tension: 2,
                friction: 8,
            }
        ).start();

        isHidden = !isHidden;
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableHighlight style={styles.button} onPress={()=> {this._toggleSubview()}}>
                    <Text style={styles.buttonText}>{this.state.buttonText}</Text>
                </TouchableHighlight>
                <Animated.View
                    style={[styles.subView,
                        {transform: [{translateX: this.state.bounceValue}]}]}
                >
                    <Text>This is a sub view</Text>
                </Animated.View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        marginTop: 66
    },
    button: {
        padding: 8,
    },
    buttonText: {
        fontSize: 17,
        color: "#007AFF"
    },
    subView: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        height: 20,
        alignItems: 'center',
        justifyContent: 'center'
    }
});*/

/*import React, {Component} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View, Dimensions} from 'react-native';

var toLeft = false;
export default class MyComponent extends Component {
    state = {
        ready: false,
        slideLeft: new Animated.Value(0),
        slideRight: new Animated.Value(0),
        sliderText: 'left'
    };

    _start = () => {
        toLeft = !toLeft;
        this.setState({sliderText : toLeft ? 'left' : 'right'}, this.animateText);
    };

    animateText =()=>{
        return Animated.parallel([
            Animated.timing(this.state.slideRight, {
                toValue: toLeft ? 0 : 1,
                duration: toLeft? 0 : 300 ,
                useNativeDriver: true,
            }), Animated.timing(this.state.slideLeft, {
                toValue: toLeft ? 1 : 0,
                duration: toLeft? 300 : 0,
                useNativeDriver: true,
            })]).start();
    }

    render() {
        let {slideRight, slideLeft} = this.state;
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.btn} onPress={() => this._start()}>
                    <Text style={styles.textBtn}>Start</Text>
                </TouchableOpacity>
                <Animated.View
                    style={{
                        transform: [
                            {
                                translateX: slideRight.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-Dimensions.get('window').width, 0],
                                }),
                            },
                        ],
                        position:'absolute',
                        top:100,
                        borderRadius: 12,
                        backgroundColor: '#c00',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={styles.text}>{this.state.sliderText}</Text>
                </Animated.View>
                <Animated.View
                    style={{
                        transform: [
                            {
                                translateX: slideLeft.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [Dimensions.get('window').width, 0],
                                }),
                            },
                        ],
                        position:'absolute',
                        top:100,
                        borderRadius: 12,
                        backgroundColor: '#c00',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={styles.text}>{this.state.sliderText}</Text>
                </Animated.View>
                {/!*<Animated.View
                    style={{
                        transform: [
                            {
                                translateY: SlideInLeft.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [600, 0]
                                })
                            }
                        ],
                        flex: 1,
                        height: 250,
                        width: 200,
                        borderRadius: 12,
                        backgroundColor: "#347a2a",
                        justifyContent: "center"
                    }}
                >
                    <Text style={styles.text}>SlideInLeft </Text>
                </Animated.View>
                <Animated.View
                    style={{
                        opacity: fadeValue,
                        flex: 1,
                        height: 250,
                        width: 200,
                        borderRadius: 12,
                        backgroundColor: "#f4f",
                        justifyContent: "center"
                    }}
                >
                    <Text style={styles.text}>Fade </Text>
                </Animated.View>*!/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
    },
    item: {},
    btn: {
        backgroundColor: '#480032',
        width: 100,
        height: 40,
        padding: 3,
        justifyContent: 'center',
        borderRadius: 6,
        marginTop: 29,
    },
    text: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    item1: {
        backgroundColor: 'red',
        padding: 20,
        width: 100,
        margin: 10,
    },

    textBtn: {
        color: '#f4f4f4',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});*/
