/**
 * Created by fly on 2017/10/30.
 * 添加超链接图层
 */

import React, {Component, PropTypes} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    PixelRatio,
    Modal,
    Alert
} from 'react-native';
import BaseComponent from "../BaseComponent";
import {toastShortBottom} from "../utils/ViewUtil";


const PlatformIOS = Platform.OS === "ios";

export default class LinkModal extends BaseComponent {

    static propType={
        insertLink: PropTypes.func.isRequired,
        updateLink: PropTypes.func.isRequired
    }

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            showLinkDialog: false,
            linkInitialUrl: "",
            linkTitle: "",
            linkUrl: "",
            keyboardHeight: 0,

        };

        this.reg=/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
    }

    //键盘显示之后， 计算键盘的高度
    keyboardWillShow(event) {
        let newKeyboardHeight = event.endCoordinates.height;
        if (this.state.keyboardHeight === newKeyboardHeight) {
            return;
        }

        this.setState({
            keyboardHeight: newKeyboardHeight
        })
    }

    //键盘隐藏之后，重置键盘的高度
    keyboardWillHide(event) {
        this.setState({
            keyboardHeight: 0
        })
    }


    /**
     * 显示modal
     * @param optionalTitle
     * @param optionalUrl
     */
    showLinkDialog(optionalTitle = "", optionalUrl = "") {
        this.setState({
            linkInitialUrl: optionalUrl,
            linkTitle: optionalTitle,
            linkUrl: optionalUrl,
            showLinkDialog: true
        });
    }

    /**
     * 隐藏modal
     * @private
     */
    _hideModal() {
        this.setState({
            showLinkDialog: false,
            linkInitialUrl: "",
            linkTitle: "",
            linkUrl: ""
        });
    }

    /**
     * 判断是否含有链接地址
     * @returns {boolean}
     * @private
     */
    _linkIsNew() {
        return !this.state.linkInitialUrl;
    }

    /**
     * 按钮文字大小写转化
     */
    _upperCaseButtonTextIfNeeded(buttonText) {
        return PlatformIOS ? buttonText : buttonText.toUpperCase();
    }


    render() {
        return (
            <View>
                <Modal
                    animationType={"fade"}
                    transparent
                    visible={this.state.showLinkDialog}
                    onRequestClose={() => this.setState({showLinkDialog: false})}
                >
                    <View style={styles.modal}>
                        <View
                            style={[
                                styles.innerModal,
                                {marginBottom: PlatformIOS ? this.state.keyboardHeight : 0}
                            ]}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <Text style={styles.inputTitle}>编辑链接</Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: "column",
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    height: 80,
                                    marginTop: 20,
                                    borderColor: "#ffffff"
                                }}
                            >
                                <View style={[styles.inputWrapper, {flex: 1}]}>
                                    <TextInput
                                        autoFocus={true}
                                        placeholder="http://"
                                        keyboardType="url"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        style={styles.input}
                                        onChangeText={text => this.setState({linkUrl: text})}
                                        value={this.state.linkUrl}
                                    />
                                </View>
                                <View style={[styles.lineSeparator]}/>
                                <View style={[styles.inputWrapper, {flex: 1}]}>
                                    <TextInput
                                        style={styles.input}
                                        onChangeText={text => this.setState({linkTitle: text})}
                                        value={this.state.linkTitle}
                                        placeholder="链接名称"
                                    />
                                </View>
                            </View>
                            {PlatformIOS && <View style={styles.lineSeparator}/>}
                            {this._renderModalButtons.bind(this)()}
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    _insertLink(url, title){

        if(!this.reg.test(url)){
            toastShortBottom('请输入正确的网址')
        }else{
            this.props.insertLink(this.state.linkUrl, this.state.linkTitle);
            this._hideModal();
        }

    }
    _updateLink(url, title){
        if(!this.reg.test(url)){
            toastShortBottom('请输入正确的网址')
        }else{
            this.props.updateLink(this.state.linkUrl, this.state.linkTitle);
            this._hideModal();
        }

    }
    /**
     * 初始化并渲染（取消 和 插入 链接）UI
     * @returns {XML}
     * @private
     */
    _renderModalButtons() {
        const insertUpdateDisabled = this.state.linkTitle.trim().length <= 0 || this.state.linkUrl.trim().length <= 0;
        const containerPlatformStyle = PlatformIOS ? {justifyContent: "space-between"} : {paddingTop: 15};
        const buttonPlatformStyle = PlatformIOS ? {flex: 1, height: 45, justifyContent: "center"} : {};
        return (
            <View
                style={[
                    {alignSelf: "stretch", flexDirection: "row"},
                    containerPlatformStyle
                ]}
            >
                {!PlatformIOS && <View style={{flex: 1}}/>}
                <TouchableOpacity
                    onPress={() => this._hideModal()}
                    style={buttonPlatformStyle}
                >
                    <Text style={[styles.button, {paddingRight: 10}]}>
                        {this._upperCaseButtonTextIfNeeded("取消")}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={insertUpdateDisabled}
                    style={buttonPlatformStyle}


                    onPress={() => {
                        if (this._linkIsNew()) {
                            this._insertLink(this.state.linkUrl, this.state.linkTitle)
                        } else {
                            this._updateLink(this.state.linkUrl, this.state.linkTitle)
                        }

                    }}

                >
                    <Text
                        style={[styles.button, {opacity: insertUpdateDisabled ? 0.5 : 1}]}
                    >
                        {this._upperCaseButtonTextIfNeeded(this._linkIsNew() ? "插入" : "更新")}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    innerModal: {
        backgroundColor: "#EEEEEE",
        paddingTop: 20,
        paddingBottom: PlatformIOS ? 0 : 20,
        paddingLeft: 20,
        paddingRight: 20,
        alignSelf: "stretch",
        margin: 40,
        borderRadius: PlatformIOS ? 8 : 2
    },
    button: {
        fontSize: 16,
        color: "#4a4a4a",
        textAlign: "center"
    },
    inputWrapper: {
        padding: 3
    },
    inputTitle: {
        color: "#4a4a4a"
    },
    input: {
        height: PlatformIOS ? 20 : 40,
        marginTop: 5,
        paddingLeft: 5
    },
    lineSeparator: {
        height: 2 / PixelRatio.get(),
        backgroundColor: "#FFFFFF"
    }
});

