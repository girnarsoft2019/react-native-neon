/**
 * Read About Action bar here:
 *      https://github.com/Osedea/react-native-action-bar
 **/
import * as Colors from './values/Colors';
import ActionBar from 'react-native-action-bar';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Platform, View} from 'react-native';
import * as Strings from './values/Strings';
import * as Dimens from './values/Dimens';
import {NeonHandler} from './NeonHandler';

let self = undefined;

/**
 * Author: Shashank
 *
 * Description:
 *      A common action bar for all the screens. The props sent to the component can be gracefully
 *      skipped. It uses default values for all styling, icons, and even the TradeInExample Title.
 *      The parameters are divided in 4 categories, namely :
 *          values              :   String values of title and Subtitle. (yet to implement Subtitle)
 *          iconMap             :   Array of icons, along with corresponding callbacks, to be rendered on Right hand side
 *          styleAttributes,    :   ActionBar styling attributes. StyleAttributes also
 *                                  include the option to add LeftImageIcon.
 *          actions             :   Callback events for titlePress and leftIcon pressed events
 *
 *      Prop: values            {title, subtitle}
 *      Prop: iconMap           [{image, onPress}] array
 *      Prop: styleAttributes   {}
 *      Prop: actions           {onLeftPress, onTitlePress}
 */
export default class ActionBarWrapper extends Component {

    updateValues = () => {
        let def_style_attr = {
            containerStyle: Platform.OS === 'ios' ? {
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: NeonHandler.getOptions().colorPrimary,
                paddingTop: 0,
            } : {height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: NeonHandler.getOptions().colorPrimary},
            titleContainerStyle: Platform.OS === 'ios' ? {
                marginTop: 16,
                height: 40,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            } : {alignItems: 'flex-start', height: 40, justifyContent: 'center', flexDirection: 'column'},
            titleStyle: Platform.OS === 'ios' ? {
                fontSize: 16,
                fontWeight: 'normal',
                fontFamily: Strings.APP_FONT,
            } : {fontSize: 20, fontFamily: Strings.APP_FONT},
            iconImageStyle: {
                resizeMode: 'contain',
                tintColor: Colors.WHITE,
                width: Dimens.icon_small,
                height: Dimens.icon_small,
            },
            leftIconImageStyle: {
                resizeMode: 'contain',
                tintColor: Colors.WHITE,
                width: Dimens.icon_small,
                height: Dimens.icon_small,
            },
            disableShadows: false,
            tintColor: NeonHandler.getOptions().colorPrimaryDark,
            badgeColor: Colors.DASHBOARD_CARD_TEXT,
            badgeTextColor: Colors.WHITE,
            leftZoneContentContainerStyle: {marginLeft: (Platform.OS === 'ios') ? 0 : 10},
        };

        let def_values = {
            title: 'Action Bar',
            subtitle: undefined,
        };

        this.style_attr = {...def_style_attr, ...this.props.styleAttributes};
        this.new_values = {...def_values, ...this.props.values};

        this.new_actions = {
            onLeftPress: () => {

                if (this.props.actions && typeof this.props.actions.onLeftPress === 'function') {
                    this.props.actions.onLeftPress();
                } else {
                    console.log('CB not handled !');
                }
            },
            onTitlePress: () => {
                if (this.props.actions && typeof this.props.actions.onTitlePress === 'function') {
                    this.props.actions.onTitlePress();
                } else {
                    console.log('CB not handled !');
                }
            },
            onRightTextPress: () => {
                if (this.props.actions && typeof this.props.actions.onRightTextPress === 'function') {
                    this.props.actions.onRightTextPress();
                } else {
                    console.log('CB not handled !');
                }
            },
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            noInternet: false,
            style_attr: {},
            new_values: {},
            new_actions: {},
        };
        this.updateValues();
    }

    render() {

        this.updateValues();
        return (
            <View>
                <ActionBar
                    containerStyle={this.style_attr.containerStyle}
                    title={this.new_values.title}
                    subtitle={this.new_values.subtitle}
                    titleContainerStyle={this.style_attr.titleContainerStyle}
                    titleStyle={this.style_attr.titleStyle}
                    leftIconImage={this.style_attr.leftIconImage}
                    leftIconImageStyle={this.style_attr.leftIconImageStyle}
                    iconContainerStyle={this.style_attr.iconContainerStyle}
                    iconImageStyle={this.style_attr.iconImageStyle}
                    disableShadows={this.style_attr.disableShadows}
                    elevation={this.style_attr.elevation}
                    onTitlePress={() => this.new_actions.onTitlePress()}
                    rightIcons={this.props.iconMap}
                    rightText={this.style_attr.rightText}
                    rightTextStyle={this.style_attr.rightTextStyle}
                    onRightTextPress={this.new_actions.onRightTextPress}
                    badgeColor={this.style_attr.badgeColor}
                    badgeTextColor={this.style_attr.badgeTextColor}
                    onLeftPress={() => this.new_actions.onLeftPress()}
                    leftZoneContentContainerStyle={this.style_attr.leftZoneContentContainerStyle}
                    backgroundColor={this.style_attr.tintColor}
                />
            </View>
        );
    }

    componentDidMount() {

    }
}

ActionBarWrapper.propTypes = {
    values: PropTypes.object,
    iconMap: PropTypes.array,
    styleAttributes: PropTypes.object,
    actions: PropTypes.object,
};