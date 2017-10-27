//import liraries
import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableHighlight,
  ListView,
  Dimensions,
  DeviceEventEmitter
} from "react-native";
import ScreenFlex from "./ScreenFlex";
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
// create a component
class StyleModal extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });

    this.state = {
      show: false,
      dataSource: ds.cloneWithRows(["正文","一级标题", "二级标题", "三级标题","列表"])
    };
  }
  _change_modal_state(isShow) {
    this.setState({
      show: isShow
    });
  }

//   选中对应的样式，通知SettingTitleComponent组件更新样式
  _selection_sytle(style){
    RCTDeviceEventEmitter.emit('updateStyle',style);
    this.setState({show:false});

  }

  //返回cell的方法
  _render_Row(rowData, sectionID, rowID, highlightRow) {
    return (
      <TouchableHighlight underlayColor="#ccc" onPress={this._selection_sytle.bind(this, rowID)}>
        <View
          style={{
            flex: 1,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
          }}
        >
          <Text
            style={{
              fontSize: 16,
              marginBottom: 0,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {rowData}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
  _renderSeparator(sectionID, rowID, highlightRow) {
    return (
      <View
        key={`${sectionID} - ${rowID}`}
        style={{
          height: 1,
          width: Dimensions.get("window").width - 5,
          marginLeft: 5,
          backgroundColor: "lightgray"
        }}
      />
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.show}
          onShow={() => {}}
          onRequestClose={() => {}}
        >
          <View style={styles.modalStyle}>
            <View style={styles.subView}>
              <View
                style={{
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  height: 30
                }}
              >
                {/* <Text style={[styles.titleText, { flex: 1 }]} /> */}
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.buttonStyle}
                  onPress={this._change_modal_state.bind(this, false)}
                >
                  <Text style={[styles.buttonText, {textAlign:'right'}]}>完成</Text>
                </TouchableHighlight>
              </View>

              <View style={[styles.horizontalLine, {}]} />

              <View style={styles.bottomView}>
                <ListView
                  style={{ flex: 1 }}
                  dataSource={this.state.dataSource}
                  renderRow={this._render_Row.bind(this)}
                  contentContainerStyle={[styles.listViewStyle, {}]} //设置cell的样式
                  renderSeparator={this._renderSeparator} // 设置分割线样式
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECF0"
  },
  // modal的样式
  modalStyle: {
    // backgroundColor:'#ccc',
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1
  },
  // modal上子View的样式
  subView: {
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: "#fff",
    alignSelf: "stretch",
    justifyContent: "flex-start",

    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#ccc",
    height: ScreenFlex.screenHeight / 2.5
  },
  // 标题
  titleText: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center"
  },
  // 内容
  contentText: {
    margin: 8,
    fontSize: 14,
    textAlign: "center"
  },
  // 水平的分割线
  horizontalLine: {
    marginTop: 3,
    height: 1,
    backgroundColor: "#ccc"
  },
  // 按钮
  bottomView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  buttonStyle: {
    flex:1,
    height: 33,
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 20
  },

  buttonText: {
    fontSize: 16,
    color: "#3393F2",
    textAlign: "center"
  },
  listViewStyle: {
    flexDirection: "column", //设置横向布局
    flexWrap: "wrap" //设置换行显示
  }
});

//make this component available to the app
export default StyleModal;
