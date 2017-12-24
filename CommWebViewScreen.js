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
    Dimensions
} from 'react-native';


const screenWidth = Dimensions.get('window').width;
const screenheight = Dimensions.get('window').height;


export default class CommWebViewScreen extends Component {
    static navigationOptions = ({ navigation }) => ({

        title: "预览内容",
        headerRight:null,
        headerLeft:(
            <View >
                    <Text style={{color:'#ffffff'}} onPress={() => navigation.goBack()}  >  取消 </Text>
            </View>
        ),


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
            url:this.props.navigation.state.params.url,
        };

    }

    render() {

        return (
            <View style={styles.container}>

                <WebView
                    style={styles.webView}
                    ref={r => this.webView = r}
                    source={{uri: this.state.url}}
                    automaticallyAdjustContentInsets={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={false}
                />


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

    webView:{
            width:screenWidth,
            height: screenheight,
            backgroundColor: '#F5FCFF',
            margin:10,

    }
});
