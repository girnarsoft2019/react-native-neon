import React, {Component} from 'react';
import {View, Image, Text, TouchableOpacity} from 'react-native';
import * as Strings from './values/Strings'

export default class NeutralView extends Component{
    render(){
        return(
            <View style={{flex:1}}>
                <View style={{flexDirection:'row', height: 80}}>
                    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                        <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}}>
                            <Image style={{height:50, width: 50}} source={require('./images/camera_icon.png')}/>
                            <Text style={{fontSize: 16, paddingLeft:10, color: 'black'}}>{Strings.CAMERA}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                        <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}}>
                            <Image style={{height:50, width: 50}} source={require('./images/gallery_icon.png')}/>
                            <Text style={{fontSize: 16, paddingLeft:10, color: 'black'}}>{Strings.GALLERY}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{height: 2, backgroundColor: 'gray', marginHorizontal: 15}}/>
                <View style={{flex:1}}></View>
                <TouchableOpacity style={{height: 48, width: '100%', alignItems:'center', justifyContent:'center'}}>
                    <Text>SUBMIT</Text>
                </TouchableOpacity>
            </View>
        )
    }

}