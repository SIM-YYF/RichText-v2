import React, {Component} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ListView,
    Dimensions,
    Image,
    Platform,
    Modal
} from "react-native";
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import BaseComponent from '../BaseComponent'

var ScreenWidth = Dimensions.get('window').width;

const colorStyles = [
    {icon: require("../../img/color_red_d53f3f.png"), text: "红色", color: '#d53f3f'},
    {icon: require("../../img/color_orange_eb7a16.png"), text: "橙色", color: '#eb7a16'},
    {icon: require("../../img/color_yellow_e0b509.png"), text: "黄色", color: '#e0b509'},
    {icon: require("../../img/color_green_8dca19.png"), text: "绿色", color: '#8dca19'},
    {icon: require("../../img/color_cyan_19caab.png"), text: "青色", color: '#19caab'},
    {icon: require("../../img/color_blue_34a7dc.png"), text: "蓝色", color: '#34a7dc'},
    {icon: require("../../img/color_purple_a765d6.png"), text: "紫色", color: '#a765d6'},
]


let showTimeout = 0;

class ColorStyleModal extends BaseComponent {

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = {
            show: false,
            udpateColorType: 'textColor',
            selectedText: null,
            dataSource: ds.cloneWithRows(colorStyles)
        };
        this._selection_sytle = this._selection_sytle.bind(this);
    }

    _change_modal_state(isFocus, type, selectedText) {


        this.setState({
            selectedText: selectedText
        })


        //编辑内容重新获取焦点时，隐藏样式层
        // if (isFocus) {
        //     this.setState({
        //         show: false
        //     });
        //     return;
        // }
        // if (!this.state.show) {
        //     this.props.getEditor().blurContentEditor()//在android下强制隐藏键盘
        // }
        this.showTimeout = setTimeout(() => {
            this.setState({
                show: !this.state.show,
                udpateColorType: type
            });
        }, 100)

    }

    componentWillUnmount() {
        clearTimeout(this.showTimeout)
    }

    /**
     * 用于操作动作切换时，隐藏正在显示的图层
     */
    hiddenModal() {
        if (this.state.show) {
            this.setState({
                show: false,
            });
        }
    }


//   选中对应的样式，通知编译器组件更新样式
    _selection_sytle(color) {
        RCTDeviceEventEmitter.emit('updateColor', {
            'udpateColorType': this.state.udpateColorType,
            'color': color,
            'selection': this.state.selectedText
        });
        if (this.state.show) {
            this.setState({
                show: false,
            });
        }
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

                    <Image style={{
                        justifyContent: "center", alignItems: "center", width: 50, height: 20,
                    }}
                           source={rowData.icon}></Image>
                    <Text
                        style={{
                            fontSize: 16,
                            margin: 10,
                            color: rowData.color,
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
                    height: 0.8,
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

                            <View style={{
                                width: ScreenWidth,
                                borderBottomWidth: 0.5,
                                borderBottomColor: '#ccc',
                                height: 30,
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                backgroundColor: '#ffffff'
                            }}>
                                <TouchableHighlight
                                    underlayColor="transparent"
                                    style={styles.buttonStyle}
                                    onPress={() => this.hiddenModal()}
                                >
                                    <Text style={{color: '#3393F2'}}> 取消 </Text>

                                </TouchableHighlight>
                            </View>

                            <View style={styles.subView}>
                                <ListView
                                    style={{flex: 1}}
                                    dataSource={this.state.dataSource}
                                    renderRow={this._render_Row.bind(this)}
                                    contentContainerStyle={[styles.listViewStyle, {}]} //设置cell的样式
                                    listSelector
                                    renderSeparator={this._renderSeparator} // 设置分割线样式
                                />
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

// define your styles
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#ECECF0",
    },
    modalStyle: {
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 1
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
