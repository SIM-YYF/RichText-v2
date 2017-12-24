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

import BrowseImagesModal from './richtext/src/modal/BrowseImagesModal'

import {toastShort} from "./richtext/src/utils/ViewUtil";

const screenWidth = Dimensions.get('window').width;
const screenheight = Dimensions.get('window').height;

const injectScript = `
  (function(){
  
    document.getElementById("zss_editor_title").setAttribute("contenteditable", false);
    document.getElementById("zss_editor_content").setAttribute("contenteditable", false);
    
    var elements = document.getElementsByTagName('div')
    for(var i=0;i<elements.length;i++){
            var element = elements[i];
            var id = element.id;
            if(id == 'div_img_close'){
               element.parentElement && element.parentElement.removeChild(element)
            }
    }
    
    
    var a_elements = document.getElementsByTagName('a');
    for(var i=0;i<a_elements.length;i++){
            var a_ele = a_elements[i];
            var id = a_ele.id;
            if(id == 'imga'){
                var attrs = a_ele.attributes;
                var img_url = attrs.href.value;
                a_ele.setAttribute("href", "javascript:window.postMessage(JSON.stringify({type:'img', url:'"+ img_url +"'}))");
            }
            
            if(id == 'link'){
                var link_attrs = a_ele.attributes;
                var link_url = link_attrs.href.value;
                a_ele.setAttribute("href", "javascript:window.postMessage(JSON.stringify({type:'link', url:'"+ link_url +"'}))");
            }
            
            
            
    }
    

     var body =  document.body.innerHTML;
     window.postMessage(JSON.stringify({type:'html', html:body}));
     
     
     
  }());
`;


export default class PreviewArticleScreen extends Component {
    static navigationOptions = ({ navigation }) => ({

        title: "预览文章",
        headerRight:(
            <View >
                    <Text style={{color:'#ffffff'}} onPress={() => navigation.state.params.onRightPress(navigation)}  >  发送 </Text>
            </View>
        ),
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
            body:'',

        };

    }




    componentDidMount() {
        this.props.navigation.setParams({
            onRightPress:this.onRightPressed.bind(this),
        })
        const {body} = this.props.navigation.state.params
        this.setState({
            body:body
        })
    }

    _injectJavaScript(){
        const script = `document.write(${this.state.body})`;
        this.webView.injectJavaScript(script)
    }


    onRightPressed(){
        toastShort(this.state.body)
    }


    _onMessage(event){
        const {type, url, html} = JSON.parse(event.nativeEvent.data);;
        if(type === 'img'){
            //查看大图
            console.log(":::::: img ====", url);
            this.BrowseImagesModal.showOriginImage(url);
            // this.props.navigation.navigate('LookOverImagesScreen', {
            //     url: url,
            // })

        }else if(type === 'link'){
            console.log(":::::: link ====", url);
            //在新的界面打开连接
            this.props.navigation.navigate('CommWebViewScreen', {
                url: url,
            })

        }else if(type === 'html'){
            console.log(":::::: html ====", html);
        }

    }

    render() {

        return (
            <View style={styles.container}>

                <WebView
                    style={styles.webView}
                    ref={r => this.webView = r}
                    source={{html: this.state.body}}
                    automaticallyAdjustContentInsets={false}
                    javaScriptEnabled={true}
                    injectedJavaScript={injectScript}
                    domStorageEnabled={true}
                    scalesPageToFit={false}
                    onMessage={(event) => this._onMessage(event)}
                />

                <BrowseImagesModal ref={(r) => (this.BrowseImagesModal = r)}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },

    webView:{
            width:screenWidth,
            height: screenheight,
            backgroundColor: '#F5FCFF',
            margin:10,

    }
});
