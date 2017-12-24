import React, {Component} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ListView,
    Dimensions,
    Modal,
    Platform
} from "react-native";
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import BaseComponent from '../BaseComponent'

var ScreenWidth = Dimensions.get('window').width;

class StyleModal extends BaseComponent {


    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        this.state = {
            currentSelection: null,
            show: false,
            dataSource: ds.cloneWithRows(["正文", "一级标题 (大)", "二级标题 (中)", "三级标题 (小)", "列表"])
        };
    }


    _change_modal_state(isFocus, selectedText) {

        this.setState({
            selectedText: selectedText
        })


        //编辑内容重新获取焦点时，隐藏样式层
        // if (isFocus) {
        //
        //     if (this.state.currentSelection === null) {
        //         this.setState({
        //             show: false
        //         });
        //
        //     }
        //     return;
        // }

        // if (!this.state.show) {
        //     this.props.getEditor().blurContentEditor()//在android下强制隐藏键盘
        // }


        this.showTimeout = setTimeout(() => {
            this.setState({
                show: !this.state.show
            });
        }, 100)
    }

    hiddenModal() {
        if (this.state.show) {
            this.setState({
                show: false,
                currentSelection: null
            });
        }

    }


    componentWillUnmount() {
        clearTimeout(this.showTimeout)
    }

    _selection_sytle(style) {
        this.setState({
            currentSelection: style
        });


        RCTDeviceEventEmitter.emit('updateStyle', {'style': style, 'selection': this.state.selectedText});

        this.setState({
            show: false
        });


    }

    keyboardWillShow(event) {
        if (this.state.show) {
            this.setState({
                show: false,
                currentSelection: null
            });
        }
    }


    //返回cell的方法
    _render_Row(rowData, sectionID, rowID, highlightRow) {
        return (

            <TouchableHighlight underlayColor="#f1f1f1" onPress={this._selection_sytle.bind(this, rowID)}>
                <View
                    style={{
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
                            alignItems: "center",
                            color: '#5c5c5c'
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
                    backgroundColor: "#f1f1f1"
                }}
            />
        );
    }

    renderView() {
        return (
            <View style={styles.container}>
                {/*<Modal*/}
                {/*animationType={"slide"}*/}
                {/*transparent={false}*/}
                {/*visible={this.state.show}*/}
                {/*onRequestClose={() => {!this.state.show}}*/}
                {/*>*/}


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

                            <View style={{width: ScreenWidth, borderBottomWidth:0.5, borderBottomColor:'#ccc',height: 30, justifyContent:'center', alignItems:'flex-end', backgroundColor:'#ffffff'}}>
                                <TouchableHighlight
                                    underlayColor="transparent"
                                    style={styles.buttonStyle}
                                    onPress={()=>this.hiddenModal()}
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

export default StyleModal;
