/**
 * Created by fly on 2017/10/30.
 * 查看大图层
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Modal,
    TouchableOpacity,

} from 'react-native';

import {ImageViewer, ImageViewerPropsDefine} from "react-native-image-zoom-viewer";



export default class BrowseImages extends Component {


    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            showBigImage:false,
            bigImageUrl:""
        };

    }

    showOriginImage(url){
        this.setState({
            showBigImage: true,
            bigImageUrl: url
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Modal
                    animationType={"fade"}
                    transparent={false}
                    visible={this.state.showBigImage}
                    onRequestClose={() => this.setState({ showBigImage: false })}
                >
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
                            style={{ width: 480, height: 800 }}
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
