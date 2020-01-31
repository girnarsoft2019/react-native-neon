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
import * as ImagePicker from 'react-native-neon';

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
            cameraOrientation: ImagePicker.ORIENTATION.LANDSCAPE,
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
