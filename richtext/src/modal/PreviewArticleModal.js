/**
 * Created by fly on 2017/10/30.
 * 预览文章
 */

import React, {Component, PropTypes} from 'react';
import {
    StyleSheet,
    Modal,
    View,
    WebView,
    Platform

} from 'react-native';

const PlatformIOS = Platform.OS === 'ios'


export default class PreviewArticleModal extends Component {





    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            showPreview: false,
            titleHtml:"",
            contentHtml:"",
        };

    }

    /**
     * 显示预览界面
     * @param titleHtml
     * @param contentHtml
     */
    showPreViewArticleModal(titleHtml, contentHtml){
        this.setState({
            titleHtml:titleHtml,
            contentHtml:contentHtml
        })
    }

    /**
     * 组装HTML代码片段
     * @param html
     * @private
     */
    _HTML = ()=>{
        return `
                <!DOCTYPEhtml>
                <html>
                
                    <head>  
                    <title>预览文章</title>  
                    <metahttp-equivmetahttp-equiv="content-type" content="text/html;charset=utf-8">  
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <meta name="format-detection" content="telephone=no">
                    <style type="text/css">  
                     * {
                            outline: 0px solid transparent;
                            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                            -webkit-touch-callout: none;
                        }
                
                        html,
                        body {
                
                            padding: 0;
                            margin: auto;
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 1em;
                            color: #2d4150;
                
                
                            height: 100%;
                            max-height: 100%;
                            width: 100%;
                            max-width: 100%;
                
                        }
                
                        body {
                            padding-left:0px;
                            padding-right:0px;
                            padding-top: 0px;
                            padding-bottom: 0px;
                
                            -webkit-overflow-scrolling: touch;
                            /*overflow-y: scroll;*/
                            height: 98%;
                        }
                    </style>  
                    </head> 
                    <body>  ${this.state.titleHtml} <p> ${this.state.contentHtml} </body> 
                
                </html>  `
    }

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    animationType={"fade"}
                    transparent={false}
                    visible={this.state.showPreview}
                    onRequestClose={() => this.setState({showPreview: false})}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >

                        <WebView
                            style={{width:'98%',height:'98%'}}
                            ref={r => (this.PreViewWebView = r)}
                            automaticallyAdjustContentInsets = {false}
                            javaScriptEnabled={true}
                            startInLoadingState={true}
                            domStorageEnabled={true}
                            // source={{headers:"", html:this._HTML, baseUrl:""}}

                        />

                    </View>
                </Modal>
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
