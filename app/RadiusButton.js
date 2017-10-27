//import liraries
import React, { Component, propTypes } from "react";
import {
  StyleSheet,
  PixelRatio,
  Text,
  View,
  TouchableHighlight,
  Platform
} from "react-native";

// create a component
class RadiusButton extends Component {
  constructor(props) {
    super(props);
  }

  // 类型检查
  static propTypes = {
    btnName: React.PropTypes.string,
    textStyle: Text.propTypes.style,
    btnStyle: TouchableHighlight.propTypes.style,
    underlayColor: TouchableHighlight.propTypes.underlayColor
  };

  //   给当前组件设置默认属性
  static defaultProps = {
    btnName: "Button",
    underlayColor: "#FF6600"
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          style={[styles.center, styles.btnDefaultStyle, this.props.btnStyle]}
          underlayColor={this.props.underlayColor}
          onPress={this.props.onPress}
        >
          <Text
            style={[
              styles.center,
              styles.textDefaultStyle,
              this.props.textStyle
            ]}
          >
            {this.props.btnName}
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center"
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10
  },

  btnDefaultStyle: {
    width: 60,
    height: 30,
    backgroundColor: "#ff8447",
    borderColor: "#ff8447",
    borderRadius: 15,
    borderWidth: (Platform.OS === "ios" ? 1.0 : 1.5) / PixelRatio.get()
  },

  textDefaultStyle: {
    fontSize: 12,
    color: "#000000"
  }
});

//make this component available to the app
export default RadiusButton;
