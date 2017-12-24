/**
 * Created by fly on 2017/10/30.
 * 查看大图层
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,

} from 'react-native';

import {ImageViewer, ImageViewerPropsDefine} from "react-native-image-zoom-viewer";



export default class LookOverImagesScreen extends Component {

    static navigationOptions = ({ navigation }) => ({

        title: "查看大图",
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
            bigImageUrl:this.props.navigation.state.params.url,
        };
    }

    render() {
        return (
            <View style={styles.container}>

                    <View
                        style={{
                            flex: 1,
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <ImageViewer
                            saveToLocalByLongPress={false}
                            style={{ width: 720, height: 1280 }}
                            imageUrls={[{ url: this.state.bigImageUrl }]}
                            enableImageZoom={true} // 是否开启手势缩放
                            index={0}
                            onClick={() => {
                                this.setState({
                                    showBigImage: false,
                                    bigImageUrl: ""
                                });
                            }}
                        />

                    </View>
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
