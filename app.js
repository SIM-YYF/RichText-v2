import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Platform,
  NativeModules,
} from "react-native";

import {
  RichTextEditor,
  RichTextToolbar,
  KeyboardSpacer
} from "./richtext/index";
import ToolBarComponent from "./app/ToolBarComponent";
import {uploadFile} from './richtext/src/utils/uploadApi';
import {getScaleSize, getFileNameFromFileURL, imagePath} from './richtext/src/utils/common';
import PreviewArticleModal from './richtext/src/modal/PreviewArticleModal'

const ImagePicker = NativeModules.ImageCropPicker;


export default class RichTextExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
    this.getHTML = this.getHTML.bind(this);
    this.setFocusHandlers = this.setFocusHandlers.bind(this);
  }

  //向编辑器中，插入超链接
  _onPressAddLink() {
    this.richtext.getSelectedText().then(selectedText => {
      this.richtext.showLinkDialog(selectedText);
    });
  }

  
  //向编辑器插入图片
  _onPressAddImage() {

    ImagePicker.openPicker({
      width: 540,
      height: 480,
      cropping: false,
      cropperCircleOverlay: false,
      compressImageMaxWidth: 540,
      compressImageMaxHeight: 480,
      compressImageQuality: 0.5,
      compressVideoPreset: "MediumQuality"
    })
      .then(image => {
        upload_url = 'https://cfs-demo.ykbenefit.com/chat/zrk/upload';//demo测试
        upload_urlD = 'https://cfs-dev.ykbenefit.com/chat/zrk/upload';//开发

        let files = {uri: image.path, type: 'application/octet-stream', name: getFileNameFromFileURL(image.path)};
        let formData = new FormData();
        console.log(files)
        formData.append('file', files);
        uploadFile(upload_urlD, formData).then(responseData => {
          //等比缩放
            let scaleSize = getScaleSize(responseData.width, responseData.height, 320, 800)
              //上传成功，将图片插入网页中。
              this.richtext.insertImage({
                width: scaleSize.width,
                height:scaleSize.height,
                src: responseData.url,
              });
        }).catch(error => {
            console.warn('上传图片失败', error)
        })
      })
      .catch(e => {
        console.warn('从图库中获取图片失败', e)
      });
  }

  //设置选中文字内容的背景样色
  _setBackgroundColor() {
    this.richtext.setBackgroundColor("red");
  }
  //设置选中的文字颜色
  _setTextColor() {
    this.richtext.setTextColor("green");
    const contentHtml = this.richtext.getContentHtml();
    console.log("contentHTML ==", contentHtml);
  }
  //插入表格
  _insertTable() {
    this.richtext.insertTable(3, 4);
    const contentHtml = this.richtext.getContentHtml();
    console.log("contentHTML ==", contentHtml);
  }
  //插入视频
  _insertEmbed() {
    let embed_url =
      "https://www.quirksmode.org/html5/videos/big_buck_bunny.mp4";
    this.richtext.insertEmbed(embed_url);


    const contentHtml = this.richtext.getContentHtml();
    console.log("contentHTML ==", contentHtml);
  }

    //插入音频
    _insertAuido() {
      let audio_url =
        "https://www.quirksmode.org/html5/videos/big_buck_bunny.wav";
      this.richtext.insertAudio({audio: audio_url,u_id:'dddd',});
    }

  //插入封面
  _onCover() {
    console.log("rn  插入封面");
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: false,
      cropperCircleOverlay: false,
      compressImageMaxWidth: 640,
      compressImageMaxHeight: 480,
      compressImageQuality: 0.5,
      compressVideoPreset: "MediumQuality"
    })
      .then(image => {
        let img_crop_path = image.path;
          upload_url = 'https://cfs-demo.ykbenefit.com/chat/zrk/upload';//demo测试
          upload_urlD = 'https://cfs-dev.ykbenefit.com/chat/zrk/upload';//开发

          let files = {uri: image.path, type: 'application/octet-stream', name: getFileNameFromFileURL(image.path)};
          let formData = new FormData();
          formData.append('file', files);
          uploadFile(upload_urlD, formData).then(responseData => {
              //等比缩放
              // let scaleSize = getScaleSize(responseData.width, responseData.height, 240, 120)
              //上传成功，将图片插入网页中。
              this.richtext.insertCoverImage({

                  src: responseData.url,
              });
          }).catch(error => {
              console.warn('上传图片失败', error)
          })
      })
      .catch(e => {
        console.log(e);
      });
  }

  _changeActionBoxState = (show) => {
      this.setState({ show: show })
      this.RichTextToolbar.changeStyleModalWithFocus()
  }

    _showPreviewArticleModal = () =>{

      let titleHTML = this.richtext.getTitleHTML();
      let contentHTML = this.richtext.getContentHTML();
      this.PreviewArticleModal.showPreViewArticleModal(titleHTML, contentHTML)

    }

  render() {

    return (
      <View style={[styles.container, { flexDirection: "column" }]}>
        <ToolBarComponent showPreviewArticleModal={this._showPreviewArticleModal}/>
        <RichTextEditor
          ref={r => (this.richtext = r)}
          style={styles.richText}
          titlePlaceholder={'标题'}
          contentPlaceholder={'正文'}

          editorInitializedCallback={() => this.onEditorInitialized()}
          addCover={() => this._onCover()} //插入封面图片的回调
          changeActionBoxState={this._changeActionBoxState}
        />
        {this.state.show ? (
          <RichTextToolbar
              ref={(r) => (this.RichTextToolbar = r)}
            getEditor={() => this.richtext} //挂载工具栏到编译器上的回调
            selectedIconTint= "#cecece"
            iconTint="#000" //工具类中每个样式按钮的颜色值
            selectedButtonStyle={{ backgroundColor: "#fff" }} // 每个样式按钮选中之后的样式
            onPressAddLink={() => this._onPressAddLink()}
            onPressAddImage={() => this._onPressAddImage()}
            setBackgroundColor={() => this._setBackgroundColor()}
            setTextColor={() => this._setTextColor()}
          
          />
        ) : null}
        {Platform.OS === "ios" && <KeyboardSpacer />}
        <View>

          <PreviewArticleModal ref={(r) => (this.PreviewArticleModal = r)}/>
        </View>
      </View>
    );
  }

  onEditorInitialized() {
    this.setFocusHandlers();
    this.getHTML();
  }

  async getHTML() {
    const titleText = await this.richtext.getTitleText();
    const titleHtml = await this.richtext.getTitleHtml();
    const contentHtml = await this.richtext.getContentHtml();
  }

  setFocusHandlers() {
    this.richtext.setTitleFocusHandler(() => {
      //alert('title focus');
    });
    this.richtext.setContentFocusHandler(() => {
      //alert('content focus');
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 20 : 0,
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
