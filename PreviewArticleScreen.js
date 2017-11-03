/**
 * Created by fly on 2017/11/2.
 */

import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,

} from 'react-native';


const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


export default class PreviewArticleScreen extends Component {
    static navigationOptions = ({ navigation }) => ({

        title: "预览文章",
        headerRight:(
            <View>
                <Text onPress={() => alert("发送")}  >  发送 </Text>
            </View>
        ),
        headerLeft:(<View>
            <Text onPress={() => alert("取消")}  >  取消 </Text>
        </View>),

        headerStyle:{backgroundColor: '#3EABF5'},

        headerTitleStyle: {
            color: '#ffffff',
            fontSize: 16,
            //居中显示
            alignSelf : 'center',
        },


        cardStack: {////是否允许右滑返回，在iOS上默认为true，在Android上默认为false
            gesturesEnabled: true,
        },

    });

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {};

    }


    render() {

        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    {this.props.navigation.state.params.contentHtml}
                </Text>


                <View/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
