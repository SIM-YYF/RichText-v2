import React, {Component} from "react";
import {
    View,
    StyleSheet,
    Image,
    Platform,
    TouchableOpacity,
    Text,
    Modal,
    Dimensions,
    TouchableHighlight
} from "react-native";
import {Audio, File, getFileNameFromFileURL} from "../utils/common";

var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;
import LoadingView from '../CMLoadingView'
class AudioStyleModal extends Component {
    constructor(props) {
        super(props);
        this.timeLenght = 10;
        this._timer = null;
        this.state = {
            show: false,
            isRecord: false,
            count: this.timeLenght,
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
    countTime() {
        this._timer = setInterval(() => {
            if (this.timeLenght < 0) {
                this.stopTime();
                //重置状态
                this._resetState();
                //停止录制并上传
                this.stopRecordAndUpload();
            } else {

                this.setState({
                    isRecord: true,
                    count: this.timeLenght--
                })
                console.log('+++++++++ 倒计时走起 = ', this.state.count)
            }

        }, 1000)
    }

    _resetState() {
        this.timeLenght = 10;
        this.setState({
            count: this.timeLenght,
            isRecord: false,
        })
    }

    /**
     * 停止计时
     */
    stopTime() {
        this._timer && clearInterval(this._timer);
    }

    _change_modal_state(isFocus) {
        if (this.state.isRecord) {
            this.stopRecord()
            this._resetState()
            this.stopTime();
        }

        //编辑内容重新获取焦点时，隐藏样式层
        // if (isFocus) {
        //     this.setState({
        //         show: false
        //     });
        //     return;
        // }
        // if (!this.state.show) {
        //     // Platform.OS === 'android' ? this.props.getEditor().blurContentEditor() : null; //在android下强制隐藏键盘
        //     // this.props.getEditor().blurContentEditor()
        // }


        // this.setState({
        //     show: !this.state.show
        // });


        this.showTimeout = setTimeout(() => {
            this.setState({
                show: !this.state.show
            });
        }, 100)


    }

    hiddenModal() {
        this.stopTime()
        this.stopRecord();
        if (this.state.show) {
            this.setState({
                show: false,
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
    stopRecordAndUpload() {
        //停止录制
        Audio.stopRecord(result => {
            //关闭录制音频的图层
            // this._change_modal_state(false)

            this.stopRecord()
            this.setState({
                show: false
            })

            let {status, voice_len, audioFileURL} = result;

            let url = "https://cfs-demo.ykbenefit.com/chat/awl/upload";

            let files = {
                uri: Platform.OS === 'ios' ? audioFileURL : "file://" + audioFileURL,
                type: "application/octet-stream",
                name: getFileNameFromFileURL(audioFileURL)
            };
            // let files = {uri: image.path, type: 'application/octet-stream', name: getFileNameFromFileURL(image.path)};

            let data = new FormData();
            data.append("file", files);

            // this.props.getEditor().insertAudio({
            //     src: '../img/loading.gif',
            //     audio: '',
            //     name: getFileNameFromFileURL(audioFileURL)
            // });


            File.upload(url, data, {
                headers: {
                    access_token: "Wsh6OptXa9cZMTlUXjyWWQ"
                }
            }).then(result => {

                //上传成功以后，将音频文件插入到HTML5中。
                if (result.status === 'success') {
                    this.props.getEditor().insertAudio({
                        src: '',
                        audio: result.data.url,
                        name: getFileNameFromFileURL(audioFileURL)
                    });
                } else {

                    this.stopTime();
                    this._resetState();
                    alert('音频上传失败，请重试!')
                }

                LoadingView.hide()

            }).catch((error)=>{

                alert('音频上传失败，请重试!')
                LoadingView.hide()
            });
        });
    }

    /**
     * 开始录制
     * @memberof AudioStyleModal
     */
    startRecord() {
        // this.setState({
        //     isRecord: !this.state.isRecord
        // });



        if (this.state.isRecord) {//正在录制
            LoadingView.show();
            this.stopTime()
            //重置状态
            this._resetState();
            //停止录制并上传
            this.stopRecordAndUpload();
        } else {//开始录制
            //开始录制
            Audio.startRecord(result => {
                this.setState({
                    isRecord: true,
                    count: this.timeLenght--
                })
                //开始计时
                this.countTime();
            });
        }

    }

    renderCircle() {
        let circleViews = []
        for (let i = 0; i < 6; i++) {
            circleViews.push(<View key={i} style={styles.circle}/>)
        }
        return circleViews;

    }

    renderView() {

        return (
            <View style={styles.container}>
                <Modal
                    animationType='slide'           // 从底部滑入
                    transparent={true}// 透明
                    visible={this.state.show}    // 根据isModal决定是否显示
                    onRequestClose={() => {
                        this.hiddenModal()
                    }}
                >
                    <View style={styles.modalStyle}>

                        <View style={{
                            height: 200,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 1,

                            width: ScreenWidth,
                            backgroundColor: '#ffffff'
                        }}>

                            <View style={{width: ScreenWidth, borderBottomWidth:0.5, borderBottomColor:'#ccc',height: 30, justifyContent:'center', alignItems:'flex-end', backgroundColor:'#ffffff'}}>
                                <TouchableHighlight
                                    underlayColor="transparent"
                                    style={styles.buttonStyle}
                                    onPress={()=>this.hiddenModal()}
                                >
                                    <Text style={{color: '#3393F2'}}> 取消 </Text>

                                </TouchableHighlight>
                            </View>



                            <View style={{alignItems: 'center', marginTop:20}}>

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

                                <View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    marginTop: 20
                                }}>

                                    {this.state.isRecord ?
                                        <View
                                            style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                height: 20
                                            }}>
                                            {this.renderCircle()}
                                        </View>
                                        : null}


                                    <Text style={styles.text}>

                                        {this.state.isRecord ? `${this.state.count}` : '点击录制'}

                                    </Text>


                                    {this.state.isRecord ?
                                        <View style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            height: 20
                                        }}>{this.renderCircle()}
                                        </View>
                                        : null}

                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
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

        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
    },

    modalStyle: {
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 1
    },

    text: {
        color: '#5c5c5c',
        fontSize: 12,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',


    },

    horizontalLine: {
        marginTop: 3,
        height: 10,
        backgroundColor: "red"
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
