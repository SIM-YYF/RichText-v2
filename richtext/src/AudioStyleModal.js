import React, {Component} from "react";
import {
    View,
    StyleSheet,
    Image,
    Platform,
    TouchableOpacity
} from "react-native";
import {Audio, File, getFileNameFromFileURL} from "./utils/common";

class AudioStyleModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            isRecord: false
        };
    }

    _change_modal_state(isFocus) {
        //编辑内容重新获取焦点时，隐藏样式层
        if (isFocus) {
            this.stopRecord();
            this.setState({
                show: false
            });
            return;
        }
        if (!this.state.show) {
            this.props.getEditor().blurContentEditor();
        }
        this.stopRecord()
        setTimeout(() => {
            this.setState({
                show: !this.state.show
            });
        }, 300)
    }

    hiddenModal() {
        this.stopRecord();

        if (this.state.show) {
            this.setState({
                show: false,
            });
        }
    }

    /**
     * 停止录制
     */
    stopRecord() {
        if (this.state.isRecord) {
            Audio.stopRecord(result => {
                this.setState({
                    isRecord: false
                })
            })
        }
    }

    /**
     * 开始录制
     * @memberof AudioStyleModal
     */
    startRecord() {
        this.setState({
            isRecord: !this.state.isRecord
        });
        if (!this.state.isRecord) {
            //开始录制
            Audio.startRecord(result => {
            });

        } else {
            //停止录制
            Audio.stopRecord(result => {
                //关闭录制音频的图层
                this._change_modal_state(false)


                let {status, voice_len, audioFileURL} = result;
                url = "https://cfs-dev.ykbenefit.com/chat/zrk/upload"; //开发
                console.log('****************  audioFileURL', audioFileURL)


                let files = {
                    uri: Platform.OS === 'ios' ? audioFileURL : "file://" + audioFileURL,
                    type: "application/octet-stream",
                    name: getFileNameFromFileURL(audioFileURL)
                };
                let data = new FormData();
                data.append("file", files);
                File.upload(url, data, {
                    headers: {
                        access_token: "o6NPBHKuVb_DtMbGa6HxWA"
                    }
                }).then(result => {

                    //上传成功以后，将音频文件插入到HTML5中。
                    if (result.status === 'success') {
                        this.props.getEditor().insertAudio({src: '../img/left_voice_icon.png', audio: result.data.url});
                    } else {
                        console.log("====================================");
                        console.log("上传音频失败", result);
                        console.log("====================================");
                    }


                });
            });
        }
    }

    renderView() {
        return (
            <View style={styles.container}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#dddddd",

                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={this.startRecord.bind(this)}
                    >
                        <Image
                            style={
                                this.state.isRecord
                                    ? {width: 120, height: 120}
                                    : {width: 120, height: 120}
                            }
                            source={
                                this.state.isRecord
                                    ? require("../img/voice_recording.gif")
                                    : require("../img/record_icon.png")
                            }
                        />
                    </TouchableOpacity>
                </View>

            </View>
        );
    }

    render() {
        if (this.state.show) {
            return this.renderView();
        } else {
            return null;
        }

    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ECECF0",
        height: 180
    }
});

export default AudioStyleModal;
