/**
 * Created by fly on 2017/11/2.
 */

import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    WebView,
    Dimensions,
    TouchableOpacity,
    Button
} from 'react-native';




import {toastShort} from "./richtext/src/utils/ViewUtil";




export default class PreviewArticleScreen extends Component {
    static navigationOptions = ({ navigation }) => ({

        title: "患教文章",
        headerRight:null,
        headerLeft:null,

        headerStyle:{backgroundColor: '#3EABF5'},
        headerTitleStyle: {
            color: '#ffffff',
            fontSize: 16,
            //居中显示
            alignSelf : 'center',
        },
        cardStack: {////是否允许右滑返回，在iOS上默认为true，在Android上默认为false
            gesturesEnabled: false,
        },

    });

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {

        };

    }

    startEditePage(){
        this.props.navigation.navigate('RichTextScreen')
    }
    render() {

        return (
            <View style={styles.container}>

                <TouchableOpacity onPress={()=>{this.startEditePage()}}>
                    <Text > 编辑患教文章 </Text>
                </TouchableOpacity>



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

});
