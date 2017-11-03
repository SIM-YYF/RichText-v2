import React, {Component} from 'react';


import RichTextScreen from './RichTextScreen'
import PreviewArticleScreen from './PreviewArticleScreen'

import {StackNavigator} from 'react-navigation'


const navigator = StackNavigator(
    {

        Home: {
            screen: RichTextScreen,
            // navigationOptions: { //导航栏配置信息，也可以在对应的Screen中，通过静态方法来设置navigationOptions. 注意：在StackNavigator中配置了navigationOptions。那么在对应Screen中，通过静态方法配置navigationOptions就会失效。
            //     headerTitle: '编辑文章',
            //
            // }
        },

        Preview: {
            screen: PreviewArticleScreen,
            // navigationOptions: {//导航栏配置信息，也可以在对应的Screen中，通过静态方法来设置navigationOptions. 注意：此处设置了, 会覆盖组件内的`static navigationOptions`设置.
            //     headerTitle: '预览文章'
            // }
        }

    },
    {
        initialRouteName: 'Home', // 默认显示界面
        initialRouteParams: '', // 初始路由的参数
        mode:'card', //页面的切换模式
        headerMode: 'screen', //导航栏的显示模式
        cardStack: {////是否允许右滑返回，在iOS上默认为true，在Android上默认为false
            gesturesEnabled: true,
        },

    }

)

export default navigator;