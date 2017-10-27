//import liraries
import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  TextInput,
  TouchableHighlight,
  Keyboard,
  Modal,
  Platform
} from "react-native";
import ToolBarComponent from "./ToolBarComponent";
import CoverComponent from "./CoverComponent";
import SettingTitleComponent from "./SettingTitleComponent";
import Screen from "./ScreenFlex";
import RadiusButton from "./RadiusButton";
import dismissKeyboard from "dismissKeyboard";
import StyleModal from './StyleModal'
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter' 
export default class editPagerComponet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _show_action_box: null,
      styleModalVisible: false,

    };
  }
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow.bind(this)
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      this._keyboardDidHide.bind(this)
    );
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow() {}

  _keyboardDidHide() {
    this.setState({
      _show_action_box: 102
    });
  }

  chanageActionBoxState(isShow, currentheight) {
    this.setState({
      _show_action_box: isShow
    });
    this._onChanageScrollViewHeight(currentheight);
  }

  _onChanageScrollViewHeight(scrollHeight) {
    this.refs.scroll.scrollTo({ y: scrollHeight });
  }

  // 插入图片
  _show_add_image() {
    RCTDeviceEventEmitter.emit('addImages',params);  
  }

  // 修改样式
  _show_update_style(visible) {
   this.refs.StyleModal._change_modal_state(visible)
  }

  _renderActionBox() {
    let isHide = false;
    if (
      this.state._show_action_box === null ||
      this.state._show_action_box === 102 ||
      this.state._show_action_box === 100
    ) {
      isHide = true;
    }

    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === 'ios'? -20: 0}
        style={{ position: "absolute", bottom: 0 }}
        behavior="position"
      >
        {
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              backgroundColor: "#c0c0c0",
              flexDirection: "row",
              width: Screen.screenWidth,
              padding: 10,
              display: isHide ? "none" : null
            }}
          >
            <TouchableHighlight
              underlayColor="#c0c0c0"
              onPress={this._show_add_image.bind(this)}
            >
              <Image
                style={{ marginLeft: 5, width: 25, height: 25 }}
                source={require("./images/add_image.png")}

              />
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor="#c0c0c0"
              onPress={this._show_update_style.bind(this)}
            >
              <Image
                style={{ marginLeft: 15, width: 25, height: 25 }}
                source={require("./images/font_style.png")}
              />
            </TouchableHighlight>

            <TouchableHighlight
              ref="_THL_hiderKeyBorder"
              style={{
                position: "absolute",
                right: 20,
                alignSelf: "center",
                padding: 10
              }}
              underlayColor="#c0c0c0"
              onPress={Keyboard.dismiss}
            >
              <Text>隐藏</Text>
            </TouchableHighlight>
          </View>
        }
      </KeyboardAvoidingView>
    );
  }

  render() {
    console.log("render");
    return (
      <View style={styles.container}>
       
        {/* 标题组件 */}
        <ToolBarComponent />
       
        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="never"
          ref="scroll"
          keyboardShouldPersistTaps={true}
          style={{ backgroundColor: "yellow" }}
        >
          <CoverComponent />

          <SettingTitleComponent
            _onChanageScrollViewHeight={this._onChanageScrollViewHeight.bind(
              this
            )}
            chanageActionBoxState={this.chanageActionBoxState.bind(this)}
          />

          {<StyleModal ref='StyleModal' ></StyleModal>}

         
        </ScrollView>

        {this._renderActionBox()}
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'ios'
    ? 20
    : 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C0C0C0"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
