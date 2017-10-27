//import liraries
import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableHighlight
} from "react-native";
import Screen from "./ScreenFlex";
import RadiusButton from "./RadiusButton";

// 显示标题的组件
class ToolBarComponent extends Component {

    
  _ok_press = () => {
    // body
    console.log("ssss");
  };

  render() {
    return (
      <View style={styles.container}>
        <RadiusButton
          btnName="取消"
          
          textStyle={[styles.radius_txt, { color: "#000000" }]}
          btnStyle={[
            styles.radius_btn,
            { backgroundColor: "#ffffff", borderColor: "#ffffff" }
          ]}
          underlayColor="#969696"
          onPress={this._ok_press}
        />
        <View style={styles.title_container}>
          <Text style={styles.title}>编辑文章</Text>
          <Text style={[styles.title, { fontSize: 12, marginTop: 4 }]}>
            袁文飞6098
          </Text>
        </View>

        <RadiusButton
          btnName="确定"
          textStyle={styles.radius_txt}
          btnStyle={[
            styles.radius_btn,
            { backgroundColor: "#ff8447", borderColor: "#ff8447" }
          ]}
          underlayColor="#FF6600"
          onPress={this._ok_press}
        />
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
   
    width: Screen.screenWidth,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#DDDDDD"
  },

  title_container: {
    width: 100,

    backgroundColor: "#DDDDDD",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },

  title: {
    textAlign: "center",
    fontSize: 15,
    fontStyle: "italic"
  },

  radius_btn: {
    width: 60,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#ff8447",
    borderColor: "#ff8447"
  },

  radius_txt: {
    fontSize: 12,
    color: "#FFFFFF"
  }
});

//make this component available to the app
export default ToolBarComponent;
