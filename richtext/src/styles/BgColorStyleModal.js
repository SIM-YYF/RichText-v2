import React, {Component} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ListView,
    Dimensions,
    Image,
    Platform
} from "react-native";
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import BaseComponent from '../BaseComponent'



const bgColorStyles = [
    {icon: require("../../img/bgcolor_d3f3bb_green.png"), text: "绿色", color:'#d3f3bb'},
    {icon: require("../../img/bgcolor_f8f4b3_yellow.png"), text: "黄色", color: '#f8f4b3'},
    {icon: require("../../img/bgcolor_f9c2bb_red.png"), text: "红色", color: '#f9c2bb'},
]

class ColorStyleModal extends BaseComponent {

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        this.state = {
            show: false,
            udpateColorType: 'textColor',
            dataSource: ds.cloneWithRows(bgColorStyles)
        };
        this._selection_sytle = this._selection_sytle.bind(this);
    }

    _change_modal_state(isFocus, type) {

        //编辑内容重新获取焦点时，隐藏样式层
        if (isFocus) {

            this.setState({

                show: false
            });
            return;
        }
        if (!this.state.show) {
            Platform.OS === 'android' ? this.props.getEditor().blurContentEditor() : null; //在android下强制隐藏键盘
        }
        this.showTimeout = setTimeout(() => {
            this.setState({
                show: !this.state.show,
                udpateColorType: type
            });
        }, 200)

    }

    hiddenModal() {
        if (this.state.show) {
            this.setState({
                show: false,
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this.showTimeout)
    }

//   选中对应的样式，通知编译器组件更新样式
    _selection_sytle(color) {
        RCTDeviceEventEmitter.emit('updateColor', {'udpateColorType': this.state.udpateColorType, 'color': color});

    }

    //返回cell的方法
    _render_Row(rowData, sectionID, rowID, highlightRow) {
        return (
            <TouchableHighlight underlayColor="#f1f1f1" onPress={this._selection_sytle.bind(this, rowData.color)}>
                <View
                    style={{
                        flex: 1,
                        height: 50,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                    }}
                >

                    <Image style={{justifyContent: "center", alignItems: "center", width: 50, height: 20,
                    }}
                           source={rowData.icon}></Image>
                    <Text
                        style={{
                            fontSize: 16,
                            margin: 10,
                            color: '#5c5c5c',
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: 'center',
                        }}
                    >
                        {rowData.text}
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
                    backgroundColor: "#f1f1f1"
                }}
            />
        );
    }

    renderView() {
        return (
            <View style={styles.container}>
                <View style={styles.subView}>
                    <ListView
                        style={{flex: 1}}
                        dataSource={this.state.dataSource}
                        renderRow={this._render_Row.bind(this)}
                        contentContainerStyle={[styles.listViewStyle, {}]} //设置cell的样式
                        renderSeparator={this._renderSeparator} // 设置分割线样式
                    />
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
    },
    subView: {
        flex: 1,
        marginLeft: 0,
        marginRight: 0,
        backgroundColor: "#fff",
        borderRadius: 5,
        borderWidth: 0.5,
        borderColor: "#ccc",
    },
    listViewStyle: {
        flexDirection: "column", //设置横向布局
        flexWrap: "wrap" //设置换行显示
    }
});

//make this component available to the app
export default ColorStyleModal;
