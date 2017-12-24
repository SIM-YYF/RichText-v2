import React, {Component} from "react";
import {
    StyleSheet,
    View,
    Platform,
    NativeModules,
    Text,
    Dimensions,
    Alert,
    BackHandler
} from "react-native";

import {
    RichTextEditor,
    RichTextToolbar,
    KeyboardSpacer
} from "./richtext/index";
import {uploadFile} from './richtext/src/utils/uploadApi';
import {getScaleSize, getFileNameFromFileURL, imagePath} from './richtext/src/utils/common';
import StyleModal from "./richtext/src/styles/StyleModal";
import AudioStyleModal from "./richtext/src/styles/AudioStyleModal";
import BgColorStyleModal from "./richtext/src/styles/BgColorStyleModal";
import ColorStyleModal from "./richtext/src/styles/ColorStyleModal";

// const ImagePicker = NativeModules.ImageCropPicker;
import ImagePicker from 'react-native-image-picker';
import {actions} from "./richtext/src/const";
import LoadingView from './richtext/src/CMLoadingView'
import {saveHtml, queryHTML, removeHtml} from "./richtext/src/utils/HtmlDao";

const screenWidth = Dimensions.get('window').width;
export default class RichTextScreen extends Component {

    static navigationOptions = ({navigation}) => ({

        //navigation.state.params.user  接受对方传递过来的参数

        headerTitle: "编辑文章",
        headerTitleStyle: {
            color: '#ffffff',
            fontSize: 18,
            //居中显示
            alignSelf: 'center',
        },

        headerStyle: {backgroundColor: '#3EABF5', height: 50},

        headerRight: (
            <View>
                <Text style={{color: '#ffffff'}}
                      onPress={() => navigation.state.params.onRightPress(navigation)}> 预览 </Text>
            </View>
        ),
        headerLeft: (<View>
            <Text style={{color: '#ffffff'}} onPress={() => navigation.state.params.onLeftPress(navigation)}> 取消 </Text>
        </View>),


        cardStack: {////是否允许右滑返回，在iOS上默认为true，在Android上默认为false
            gesturesEnabled: true,
        },


    });


    constructor(props) {
        super(props);
        this.state = {
            show: false,
            titleHtml: null,
            contentHtml:null
        };
        this.getHTML = this.getHTML.bind(this);
        this.setFocusHandlers = this.setFocusHandlers.bind(this);
        this.selectedText = null;


    }



    componentWillUnmount() {

       clearInterval(this.IntervalTime)

    }
    componentWillMount() {
        this._handlerQueryHtml();
        this._handlerSaveHTML();
    }
    componentDidMount() {
        this.props.navigation.setParams({
            onRightPress: this.onRightPressed.bind(this),
            onLeftPress: this.onLeftPressed.bind(this)
        })
    }

    _handlerQueryHtml(){

        queryHTML((data) =>{
            this.setState({
                titleHtml: data.html.titleHtml,
                contentHtml: data.html.contentHtml,
            })

        })
    }

    _handlerSaveHTML(){

        this.IntervalTime = setInterval(()=>{

            this.getHTML()

        }, 8000)
    }


    async getHTML() {
        // const titleText = await this.richtext.getTitleText();
        const titleHtml = await this.richtext.getTitleHtml();
        const contentHtml = await this.richtext.getContentHtml();

        const html = new Object();
        html.titleHtml = titleHtml;
        html.contentHtml = contentHtml;

        saveHtml(html,(data)=>{
            // console.log(":::::: 保存html = ", JSON.stringify(data));
        })

    }
    async saveHtmlAndGoBack() {
        // const titleText = await this.richtext.getTitleText();
        const titleHtml = await this.richtext.getTitleHtml();
        const contentHtml = await this.richtext.getContentHtml();

        const html = new Object();
        html.titleHtml = titleHtml;
        html.contentHtml = contentHtml;
        LoadingView.show()
        saveHtml(html,(data)=>{
            // console.log(":::::: 保存html = ", JSON.stringify(data));
            LoadingView.hide();
            this.props.navigation.goBack();
        })

    }

    removeHtmlAndGoBack(){
        LoadingView.show()
        removeHtml((data)=>{
            LoadingView.hide();
            this.props.navigation.goBack();
        })
    }


    onRightPressed() {
        this.richtext.getBodyHtml().then((body) => {
            this.props.navigation.navigate('PreviewArticleScreen', {
                body: body,
                callback: () => {
                }
            })
        });

        // Promise.all([promise_title, promise_content]).then( (values) => {
        //    const titleHtml = values[0];
        //    const contentHtml = values[1];
        //
        //    console.log("::::::::::: 获取标题 = ", titleHtml);
        //    console.log("::::::::::: 获取内容 = ", contentHtml);
        //
        //     this.props.navigation.navigate('PreviewArticleScreen',{
        //         title:titleHtml,
        //         body:contentHtml,
        //         callback: ()=>{
        //         }
        //     })
        //
        // });


    }

    onLeftPressed(navigation) {
            Alert.alert(
                '是否保存草稿箱中',
                '',
                [
                    {text: '不保存', onPress: () => this.removeHtmlAndGoBack()},
                    {text: '保存', onPress: () => {
                        this.saveHtmlAndGoBack()
                    }}
                ]
            );


    }


    //向编辑器中，插入超链接
    _onPressAddLink() {
        this.richtext.getSelectedText().then(selectedText => {
            this.richtext.showLinkDialog(selectedText);
        });
    }



    _onPressAddImage2() {
        const options = {
            quality: 1.0,
        };



        ImagePicker.launchImageLibrary(options, (image) => {
            let upload_urlD = 'https://cfs-demo.ykbenefit.com/temp/awl/uploads';

            if (image.didCancel) {
                //console.log('用户取消了选择！');
                return;
            }
            if (image.error) {
                alert("选择图片失败！请重试！");
                return;
            }


            LoadingView.show()

            let files = {uri: image.uri, type: 'application/octet-stream', name: getFileNameFromFileURL(image.uri)};
            let formData = new FormData();
            formData.append('file', files);
            uploadFile(upload_urlD, formData).then(responseData => {
                let image_data = responseData[0]
                //等比缩放
                let scaleSize = getScaleSize(image_data.width, image_data.height, screenWidth - 50, 240)
                //上传成功，将图片插入网页中。
                this.richtext.insertImage({
                    img_id: image_data.temp_id,
                    width: scaleSize.width,
                    height: scaleSize.height,
                    name: getFileNameFromFileURL(image.path),
                    src: image_data.url,
                });

                // this.richtext.focusContent();
                LoadingView.hide()

            }).catch(()=>{
                LoadingView.hide()
                alert("上传图片失败,请重试！")

            })


        });


    }

    _onPressAddImage() {

        // ImagePicker.openPicker({
        //     // width: 540,
        //     // height: 480,
        //     mediaType:"photo",
        //     cropping: false,
        //
        //     // compressImageMaxWidth: 540,
        //     // compressImageMaxHeight: 480,
        //     compressImageQuality: 1,
        // })
        //     .then(image => {
        //         upload_urlD = 'https://cfs-demo.ykbenefit.com/temp/awl/uploads';
        //
        //         // //上传成功，将图片插入网页中。
        //         // this.richtext.insertImage({
        //         //     name:getFileNameFromFileURL(image.path)
        //         // });
        //
        //
        //         LoadingView.show()
        //         let files = {uri: image.path, type: 'application/octet-stream', name: getFileNameFromFileURL(image.path)};
        //         let formData = new FormData();
        //         console.log(files)
        //         formData.append('file', files);
        //         uploadFile(upload_urlD, formData).then(responseData => {
        //             let image_data = responseData[0]
        //             //等比缩放
        //             let scaleSize = getScaleSize(image_data.width, image_data.height,  screenWidth - 50, 240)
        //             //上传成功，将图片插入网页中。
        //             this.richtext.insertImage({
        //                 img_id:image_data.temp_id,
        //                 width: scaleSize.width,
        //                 height:scaleSize.height,
        //                 name:getFileNameFromFileURL(image.path),
        //                 src: image_data.url,
        //             });
        //             this.richtext.focusContent();
        //             LoadingView.hide()
        //         }).catch(error => {
        //             alert("上传图片失败,请重试！")
        //             LoadingView.hide()
        //         })
        //
        //
        //     })
        //     .catch(e => {
        //         // alert("未选中图片或图片格式不对")
        //     });
    }

    //设置选中文字内容的背景样色
    // _setBackgroundColor() {
    //     this.richtext.setBackgroundColor("red");
    // }
    //设置选中的文字颜色
    // _setTextColor() {
    //     this.richtext.setTextColor("green");
    //     const contentHtml = this.richtext.getContentHtml();
    //     console.log("contentHTML ==", contentHtml);
    // }
    //插入表格
    // _insertTable() {
    //     this.richtext.insertTable(3, 4);
    //     const contentHtml = this.richtext.getContentHtml();
    //     console.log("contentHTML ==", contentHtml);
    // }
    //插入视频
    // _insertEmbed() {
    //     let embed_url =
    //         "https://www.quirksmode.org/html5/videos/big_buck_bunny.mp4";
    //     this.richtext.insertEmbed(embed_url);
    //
    //
    //     const contentHtml = this.richtext.getContentHtml();
    //     console.log("contentHTML ==", contentHtml);
    // }

    //插入音频
    _insertAuido() {
        let audio_url =
            "https://www.quirksmode.org/html5/videos/big_buck_bunny.wav";
        this.richtext.insertAudio({audio: audio_url, u_id: 'dddd',});
    }

    //插入封面
    _onCover() {
        // console.log("rn  插入封面");
        // ImagePicker.openPicker({
        //     width: 300,
        //     height: 300,
        //     cropping: false,
        //     cropperCircleOverlay: false,
        //     compressImageMaxWidth: 640,
        //     compressImageMaxHeight: 480,
        //     compressImageQuality: 0.5,
        //     compressVideoPreset: "MediumQuality"
        // })
        //     .then(image => {
        //         let img_crop_path = image.path;
        //         upload_url = 'https://cfs-demo.ykbenefit.com/chat/zrk/upload';//demo测试
        //         upload_urlD = 'https://cfs-dev.ykbenefit.com/chat/zrk/upload';//开发
        //
        //         let files = {uri: image.path, type: 'application/octet-stream', name: getFileNameFromFileURL(image.path)};
        //         let formData = new FormData();
        //         formData.append('file', files);
        //         uploadFile(upload_urlD, formData).then(responseData => {
        //             //等比缩放
        //             // let scaleSize = getScaleSize(responseData.width, responseData.height, 240, 120)
        //             //上传成功，将图片插入网页中。
        //             this.richtext.insertCoverImage({
        //
        //                 src: responseData.url,
        //             });
        //         }).catch(error => {
        //             console.warn('上传图片失败', error)
        //         })
        //     })
        //     .catch(e => {
        //         console.log(e);
        //     });
    }

    _changeActionBoxState = (show) => {

        this.setState({show: show})
        this.changeStyleModalWithFocus()
    }

    /**
     * 编辑区域从新获取焦点时，隐藏对应model
     * @private
     */
    _contentResForcusHandler = () => {
        this.changeStyleModalWithFocus()
    }


    render() {

        return (
            <View style={[styles.container, {flexDirection: "column"}]}>

                <RichTextEditor
                    ref={r => (this.richtext = r)}
                    style={styles.richText}
                    titlePlaceholder={'标题'}
                    contentPlaceholder={'正文'}
                    initialTitleHTML={this.state.titleHtml}
                    initialContentHTML={this.state.contentHtml}
                    editorInitializedCallback={() => this.onEditorInitialized()}
                    addCover={() => this._onCover()} //插入封面图片的回调
                    changeActionBoxState={this._changeActionBoxState}
                    contentResForcusHandler={this._contentResForcusHandler}
                />


                {this.state.show ? (
                    <RichTextToolbar
                        ref={(r) => (this.RichTextToolbar = r)}
                        getEditor={() => this.richtext} //挂载工具栏到编译器上的回调
                        selectedIconTint="#cecece"
                        // iconTint="#000" //工具类中每个样式按钮的颜色值
                        // selectedButtonStyle={{ backgroundColor: "#fff" }} // 每个样式按钮选中之后的样式
                        onPressAddLink={() => this._onPressAddLink()}
                        setBackgroundColor={() => this._setBackgroundColor()}
                        setTextColor={() => this._setTextColor()}
                        onActionItemPress={(action) => this._onActionItemPress(action)}

                    />
                ) : null}
                {Platform.OS === "ios" && <KeyboardSpacer/>}

                <View>

                    <StyleModal ref={r => (this.StyleModal = r)} getEditor={() => this.richtext} keyboardHeight={280}/>
                    <ColorStyleModal ref={r => (this.ColorStyleModal = r)} getEditor={() => this.richtext}/>
                    <BgColorStyleModal ref={r => (this.BgColorStyleModal = r)} getEditor={() => this.richtext}/>
                    <AudioStyleModal ref={r => (this.AudioStyleModal = r)} getEditor={() => this.richtext}/>
                </View>

            </View>
        );
    }

    changeStyleModalWithFocus() {
        // this.StyleModal._change_modal_state(true)
        // this.ColorStyleModal._change_modal_state(true)
        // this.BgColorStyleModal._change_modal_state(true)
        // this.AudioStyleModal._change_modal_state(true)
    }


    _onActionItemPress = (action) => {

        switch (action) {
            case actions.insertImage: //在插入点插入一张图片（删除选中的部分）
                this.richtext.prepareInsert();

                // this.StyleModal.hiddenModal()
                // this.BgColorStyleModal.hiddenModal()
                // this.ColorStyleModal.hiddenModal()
                // this.AudioStyleModal.hiddenModal()

                this._onPressAddImage2();

                break;
            case actions.insertAudio: //在插入音频（删除选中的部分）

                this.richtext.prepareInsert();

                this.StyleModal.hiddenModal()
                this.BgColorStyleModal.hiddenModal()
                this.ColorStyleModal.hiddenModal()
                this.AudioStyleModal._change_modal_state(false);


                // this.state.editor.prepareInsert();
                // if (this.props.insertAudio) {
                //   this.props.insertAudio();
                // }
                break;
            case actions.setBold: //开启或关闭选中文字或插入点的粗体字效果
            case actions.setItalic: //在光标插入点开启或关闭斜体字
                this.richtext.prepareInsert();
                this.richtext.getSelectedText().then(selectedText => {
                    if (selectedText.length > 0) {
                        // this.selectedText = selectedText
                    }

                    this.richtext._sendAction(action, selectedText);
                })


                break;

            case actions.box_style: //修改样式
                //弹窗,选择样式,同时隐藏文色和背景色图层
                this.richtext.prepareInsert();
                this.richtext.getSelectedText().then(selectedText => {
                    if (selectedText.length > 0) {
                        // this.selectedText = selectedText
                    }
                    // this.AudioStyleModal.hiddenModal()
                    // this.ColorStyleModal.hiddenModal()
                    // this.BgColorStyleModal.hiddenModal()
                    this.StyleModal._change_modal_state(false, selectedText);
                })

                break;

            case actions.box_text_color: //修改字体颜色
                this.richtext.prepareInsert();
                this.richtext.getSelectedText().then(selectedText => {
                    if (selectedText.length > 0) {
                        // this.selectedText = selectedText
                    }
                    //弹窗，选择样式
                    // this.AudioStyleModal.hiddenModal()
                    // this.StyleModal.hiddenModal()
                    // this.BgColorStyleModal.hiddenModal()
                    this.ColorStyleModal._change_modal_state(false, "textColor", selectedText);
                });

                break;
            case actions.box_background_color: //修改字体背景颜色
                this.richtext.prepareInsert();
                this.richtext.getSelectedText().then(selectedText => {
                    if (selectedText.length > 0) {
                        // this.selectedText = selectedText
                    }
                    //弹窗，选择样式
                    // this.AudioStyleModal.hiddenModal()
                    // this.StyleModal.hiddenModal()
                    // this.ColorStyleModal.hiddenModal();
                    this.BgColorStyleModal._change_modal_state(false, "backgroundColor", selectedText);
                })

                break;
            case actions.insertLink: //添加超链接
                this.richtext.prepareInsert();

                if (this.richtext.onPressAddLink) {
                    this.richtext.onPressAddLink();
                }
                break;
            case actions.setHR: //插入分隔线
                this.richtext._sendAction(action);
                break;
        }
    }

    onEditorInitialized() {
        this.setFocusHandlers();
        // this.getHTML();
    }


    setFocusHandlers() {
        this.richtext.setTitleFocusHandler(() => {
            //alert('title focus');
            this.setState({
                show: false
            })
        });
        this.richtext.setContentFocusHandler(() => {
            //alert('content focus');
            console.log('内容区域获取焦点');
            // this.AudioStyleModal.hiddenModal()
            // this.StyleModal.hiddenModal()
            // this.ColorStyleModal.hiddenModal()
            // this.BgColorStyleModal.hiddenModal()
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff"
    },
    richText: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
    },
    toolbar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0
    }
});
