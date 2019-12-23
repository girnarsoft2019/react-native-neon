/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import App1 from './App1';
import App2 from './App2';
import App3 from './App3';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import {name as appName} from './app.json';
import * as ImagePicker from './src';

const stackNavigator = createStackNavigator({
    app: {screen: App, navigationOptions: {header: null}},
    app1: {screen: App1, navigationOptions: {header: null}},
    app2: {screen: App2, navigationOptions: {header: null}},
    app3: {screen: App3, navigationOptions: {header: null}},
    neon: {screen: ImagePicker.neonNavigator, navigationOptions: {header: null}}
});

const AppContainer = createAppContainer(stackNavigator);
AppRegistry.registerComponent(appName, ()=> AppContainer);

