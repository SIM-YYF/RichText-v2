import React, {Component} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ListView,
    Dimensions
} from "react-native";
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import BaseComponent from './BaseComponent'

class ColorStyleModal extends BaseComponent {

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        this.state = {
            show: false,
            udpateColorType: 'textColor',
            dataSource: ds.cloneWithRows(['red', 'green', 'blue'])
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
            this.props.getEditor().blurContentEditor();
        }
        setTimeout(() => {
            this.setState({
                show: !this.state.show,
                udpateColorType: type
            });
        }, 350)

    }

    hiddenModal(){
        if(this.state.show){
            this.setState({
                show: false,
            });
        }
    }


//   选中对应的样式，通知编译器组件更新样式
    _selection_sytle(color) {
        RCTDeviceEventEmitter.emit('updateColor', {'udpateColorType': this.state.udpateColorType, 'color': color});
        this.setState({
            show: false
        });
    }

    //返回cell的方法
    _render_Row(rowData, sectionID, rowID, highlightRow) {
        let content = null;
        switch (rowData) {
            case 'red':
                content = '红色';
                break;
            case 'green':
                content = '绿色';
                break;
            case 'blue':
                content = '蓝色';
                break;
            default:
                break;
        }
        return (
            <TouchableHighlight underlayColor="#ccc" onPress={this._selection_sytle.bind(this, rowData)}>
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
                            fontSize: 14,
                            marginBottom: 0,
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        {content}
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
        flex:1,
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
