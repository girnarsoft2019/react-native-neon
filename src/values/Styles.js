import {Platform, StyleSheet} from 'react-native';
import * as Colors from "./Colors";
import * as Dimens from './Dimens'
import * as Strings from './Strings';

export const _ActionBarStyle = Platform.OS === 'ios' ? StyleSheet.create({
    content: {height: Platform.OS === "ios" ? 56:56, justifyContent: 'center', alignItems: "center", backgroundColor: Colors.PRIMARY,paddingTop:0},
    titleContainer: {marginTop:16,height:40,alignItems: 'flex-start', justifyContent: 'flex-start'},
    title: {fontSize: 16, fontWeight:'normal',fontFamily: Strings.APP_FONT},
    icon: {resizeMode: 'contain', tintColor: Colors.WHITE, width:Dimens.icon_normal, height:Dimens.icon_normal},
    iconBack: {resizeMode: 'contain', tintColor: Colors.WHITE, width:Dimens.icon_x_small, height:Dimens.icon_x_small},
    i_container: {width: 50, height: 50, justifyContent: 'center', alignItems: 'center',},
}) : StyleSheet.create({
    content: {height: 56, justifyContent: 'center', alignItems: "center", backgroundColor: Colors.PRIMARY},
    titleContainer: {alignItems: 'flex-start', height: 40, justifyContent: 'center', flexDirection: 'column'},
    title: {fontSize: 20,fontFamily: Strings.APP_FONT},
    icon: {resizeMode: 'contain', tintColor: Colors.WHITE,width:Dimens.icon_normal, height:Dimens.icon_normal},
    iconBack: {resizeMode: 'contain', tintColor: Colors.WHITE, width:Dimens.icon_small, height:Dimens.icon_small},
    i_container: {width: 50, height: 50, justifyContent: 'center', alignItems: 'center',},
    leftZoneContentContainerStyle: {marginLeft: (Platform.OS === 'ios') ? 0 : 10}
});
