//import liraries
import React, { Component } from "react";
import aaa, {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  KeyboardAvoidingView,
  TouchableHighlight,
  findNodeHandle
} from "react-native";
import Screen from "./ScreenFlex";
import ActionBox from "./ActionBox";
import RCTDeviceEventEmitter from "RCTDeviceEventEmitter";
console.log('aaa',aaa)
let scrollHeight = 0;
const currentheight = 0;

// create a component
class SettingTitleComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: "",
      input_height: 45,
      target_input:null,
      fontSize: 14,
      backgroundStyle: '#00000000',
      inputs:["mb_default"],
      imgArr:[]
    };
  }

  componentDidMount() {
    const self = this;
    this.imageListener = RCTDeviceEventEmitter.addListener("addImages", (fs) => {

      var newimgArr = self.state.imgArr.slice(0)
      newimgArr.push(fs)
      self.setState({
        imgArr:newimgArr
      })
    })
    this.listener = RCTDeviceEventEmitter.addListener("updateStyle", (fs) => {

      // 接受到通知后的处理
      //this.props.refs.aaa.style
      // this.refs.mb_default.style.fontSize = 18
      let fsInt = parseInt(fs);
      let tempFontSize = 14;
      let tempBackGroundColor = "#00000000";
      if (fsInt === 0) {
        tempFontSize = 18;
      } else if (fsInt === 1) {
        tempFontSize = 12;
      } else if (fsInt === 2) {
        tempFontSize = 14;
      } else if (fsInt === 3) {
        //引用
        tempBackGroundColor = "#c0c0c0";
      } else {
        // 列表
      }
      this.setState({
        fontSize: tempFontSize,
        backgroundStyle: tempBackGroundColor
      });
      // for (let i = 0; i < this.state.inputs.length; i++) {
      //   let element = this.state.inputs[i];
      //   for (let key in this.refs) {
      //       if(element === key){
      //         const {key} = this.refs
      //         // this.refs.key.style.fontSize = 18
      //         return;
      //       }
      //   }
      // }
    });
  }

  
 componentWillUnmount() {
  //  移除接受通知事件监听
  this.listener.remove();
 }
 _onChange(event) {
    // body
    this.setState({
      text: event.nativeEvent.text,
      input_height: event.nativeEvent.contentSize.height,
      target_input: event.nativeEvent.target
      
    });
  };

  _onContetSizeChange(event) {
    // event: {nativeEvent: {contentSize: { width: number, height: number}}}
    contentHeight = event.nativeEvent.contentSize.height;

    this.props._onChanageScrollViewHeight(contentHeight);
  }
  _chanageActionBoxState(state,e) {
    console.log('-------------------_chanageActionBoxState')
    console.log(this.refs)
    console.log(findNodeHandle(this.refs['input_0']))
    console.log(e.target)
    this.props.chanageActionBoxState(state, this.state.input_height);
  }
  imgPress(index,e){
    var newimgArr = this.state.imgArr.slice(0)
    newimgArr[index].isDel = true
    // const delArr = newimgArr.splice(index,1)[0]
    // console.log('delArr',delArr)
    this.setState({
      imgArr:newimgArr
    })
  }
  _dynamic_add_txtInput() {
    const self = this;
    const imgArr = this.state.imgArr
    return imgArr.map((ele,index)=>{
      return (
        <View
        key={index}
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000088"
        }}
      >
        {ele.isDel === true ?null: <TouchableHighlight
                  ref={`img_${index}`}
                  data-type={index}
                  onPress={this.imgPress.bind(this,index)}
                >
                  <Image
                    style={{ width: 100, height: 100 }}
                    source={require("./images/ic_launcher.png")}
                  />
                </TouchableHighlight>}
       
          <TextInput
            ref={`input_${index}`}
            data-type={index}
            placeholder="继续...."
            placeholderTextColor="#c0c0c0"
            onChange={self._onChange.bind(self)}
            value={self.state.text}
            onContentSizeChange={self._onContetSizeChange.bind(self)}
            onFocus={self._chanageActionBoxState.bind(self, 101)}
            multiline={true}
            style={{
              width: Screen.screenWidth,
              height: Math.max(45, self.state.input_height),
              borderWidth: 0,
              marginTop: 20,
              marginLeft: 10,
              fontSize: self.state.fontSize,
              borderColor: "#00000000"
            }}
          />
      
      </View>
      );
    })
    
  }
  render() {
    return (
      <View style={[styles.container, { flexDirection: "column" }]}>
        <TextInput
          style={[styles.inputs, { height: 45 }]}
          placeholder="标题"
          multiline={true}
          onFocus={this._chanageActionBoxState.bind(this, 100)}
        />
        <KeyboardAvoidingView behavior="padding">
          <TextInput
            ref="mb_default"
            placeholder="正文"
            placeholderTextColor="#c0c0c0"
            onChange={this._onChange.bind(this)}
            value={this.state.text}
            onContentSizeChange={this._onContetSizeChange.bind(this)}
            onFocus={this._chanageActionBoxState.bind(this, 101)}
            multiline={true}
            style={{
              width: Screen.screenWidth,
              height: Math.max(45, this.state.input_height),
              fontSize:this.state.fontSize,
              borderWidth: 0,
              marginTop: 20,
              marginLeft: 10,
              borderColor: "#00000000"
            }}
          />
        </KeyboardAvoidingView>
        {this._dynamic_add_txtInput.bind(this)()}
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Screen.screenWidth,

    alignItems: "center",
    backgroundColor: "red"
  },

  inputs: {
    borderWidth: 1,
    margin: 5,

    borderBottomColor: "#fff",
    borderLeftColor: "#00000000",
    borderTopColor: "#00000000",
    borderRightColor: "#00000000"
  }
});

//make this component available to the app
export default SettingTitleComponent;
