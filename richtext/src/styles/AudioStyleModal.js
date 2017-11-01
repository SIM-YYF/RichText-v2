import React, {Component} from "react";
import {
    View,
    StyleSheet,
    Image,
    Platform,
    TouchableOpacity,
    Text
} from "react-native";
import {Audio, File, getFileNameFromFileURL} from "../utils/common";

class AudioStyleModal extends Component {
    constructor(props) {
        super(props);
        this.timeLenght = 10;
        this._timer = null;
        this.state = {
            show: false,
            isRecord: false,
            count:this.timeLenght,
        };
    }

    // countTime(){
    //     this._timer=setInterval(()=>{this.setState({data:this._index--}); if(this.state.data<=0){
    //         this._timer && clearInterval(this._timer);
    //         alert("时间到了");
    //     }},1000);
    // }

    /**
     * 开始计时
     */
    countTime(){
        this._timer = setInterval(() => {
            if(this.timeLenght < 0){
                this.stopTime();
                //重置状态
                this._resetState();
                //停止录制并上传
                this.stopRecordAndUpload();
            }else{

                this.setState({
                    isRecord: true,
                    count: this.timeLenght--
                })
                console.log('+++++++++ 倒计时走起 = ', this.state.count)
            }

        }, 1000)
    }

    _resetState(){
        this.timeLenght = 10;
        this.setState({
            count:this.timeLenght,
            isRecord: this.state.isRecord,
        })
    }
    /**
     * 停止计时
     */
    stopTime(){
        this._timer && clearInterval(this._timer);
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

        // this.setState({
        //     show: !this.state.show
        // });


        this.showTimeout = setTimeout(() => {
            this.setState({
                show: !this.state.show
            });
        }, 200)


    }

    hiddenModal() {
        this.stopTime()
        this.stopRecord();
        if (this.state.show) {
            this.setState({
                show:false,
            })
            //重置状态
            this._resetState();
        }
    }

    componentWillUnmount() {
        this.showTimeout && clearTimeout(this.showTimeout)
        this.stopTime();
    }

    /**
     * 只是停止录制，不做上传的逻辑
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
     * 停止录制并删除
     */
    stopRecordAndUpload(){
        //停止录制
        Audio.stopRecord(result => {
            //关闭录制音频的图层
            this._change_modal_state(false)


            let {status, voice_len, audioFileURL} = result;
            url = "https://cfs-dev.ykbenefit.com/chat/zrk/upload"; //开发

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

                    this.stopTime();
                    this._resetState();
                }


            });
        });
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

            //开始计时
            this.countTime();

            //开始录制
            Audio.startRecord(result => {
            });

        } else {
            this.stopTime()
            //重置状态
            this._resetState();

            //停止录制并上传
            this.stopRecordAndUpload();
        }
    }

    renderCircle() {
        let circleViews = []
        for (let i = 0; i < 6; i++) {
            circleViews.push(<View style={styles.circle}/>)
        }
        return circleViews;

    }

    renderView() {

        return (
            <View style={styles.container}>

                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={this.startRecord.bind(this)}
                >
                    <Image
                        style={{width: 65, height: 65}}
                        source={
                            this.state.isRecord
                                ? require("../../img/icon_click_stop_recording.png")
                                : require("../../img/icon_click_record.png")
                        }
                    />
                </TouchableOpacity>

                <View style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 20}}>

                    {this.state.isRecord ?
                        <View
                        style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', height: 20}}>
                        {this.renderCircle()}
                        </View>
                        : null}



                    <Text style={styles.text}>

                        {this.state.isRecord ? `${this.state.count}` : '点击录制'}

                    </Text>


                    {this.state.isRecord ?
                        <View style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', height: 20}}>{this.renderCircle()}
                        </View>
                        : null}

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
        backgroundColor: "#FFFFFF",
        height: 180,
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
    },

    text: {
        color: '#5c5c5c',
        fontSize: 12,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',


    },

    circle: {
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: '#e59f19',
        margin: 5,
    }
});

export default AudioStyleModal;
