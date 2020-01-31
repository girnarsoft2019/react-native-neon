/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import {name as appName} from './app.json';
import * as ImagePicker from 'react-native-neon';

const stackNavigator = createStackNavigator({
    app: {screen: App, navigationOptions: {header: null}},
    ...ImagePicker.neonNavigator
});

const AppContainer = createAppContainer(stackNavigator);
AppRegistry.registerComponent(appName, ()=> AppContainer);

