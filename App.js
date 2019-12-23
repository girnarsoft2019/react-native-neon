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
  TouchableOpacity, PermissionsAndroid,
} from 'react-native';
import * as ImagePicker from './src';
import * as ImagePickerOriginal from './srcOriginal';

class App extends Component{
  componentDidMount(){
    console.log('componentDidMount');
    this.askForPermission()
  }

  async askForPermission() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]);
      if (granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED && granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED) {

      } else {

      }
    } catch (err) {
      console.warn(err)
    }
  }

  onImageCollection = (data) => {
    console.log(data)
  };

  openCamera = () => {
    //this.props.navigation.navigate('CameraViewPage')
    ImagePicker.getCamera({
      callback: this.onImageCollection,
      navigation: this.props.navigation,
      resultRoute:'app'
    });
  };

  openGallery = () => {
    ImagePickerOriginal.getAlbum({
      callback: this.onImageCollection,
      navigation: this.props.navigation,
      resultRoute: 'app'
    });
    /*ImagePicker.getAlbum({
      callback: this.onImageCollection,
      navigation: this.props.navigation,
      resultRoute: 'app'
    });*/
  };

  openNeutral = () => {
    this.props.navigation.navigate('NeutralViewPage')
    ImagePicker.openNeutral({
      callback: this.onImageCollection,
      navigation: this.props.navigation,
      resultRoute: 'app'
    });
  };

  render(){
    console.log('render');
    return(
        <View style={{backgroundColor:'white', flex:1}}>
          <TouchableOpacity style={{marginTop:15, justifyContent:'center', alignItems:'center', backgroundColor:'green'}} onPress={()=> this.openGallery()}>
            <Text style={{padding:12, color:'white'}}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop:15, justifyContent:'center', alignItems:'center', backgroundColor:'green'}} onPress={()=> this.openCamera()}>
            <Text style={{padding:12, color:'white'}}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop:15, justifyContent:'center', alignItems:'center', backgroundColor:'green'}} onPress={()=> this.openNeutral()}>
            <Text style={{padding:12, color:'white'}}>Neutral</Text>
          </TouchableOpacity>
        </View>
    )
  }

}

export default App;
