import React, {Component, PropTypes} from "react";
import WebViewBridge from "react-native-webview-bridge-updated";
import {InjectedMessageHandler} from "./WebviewMessageHandler";
import {actions, messages} from "./const";
import {
    View,
    StyleSheet,
    Platform,
    PixelRatio,
    Keyboard,
    Dimensions,
} from "react-native";
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter';
import {Audio, File} from "./utils/common";
import LinkModal from './modal/LinkModal'
import BrowseImagesModal from './modal/BrowseImagesModal'

const injectScript = `
  (function () {
    ${InjectedMessageHandler}
  }());
`;
const PlatformIOS = Platform.OS === "ios";
export default class RichTextEditor extends Component {
    //初始化默认属性
    static defaultProps = {
        contentInset: {},
        style: {}
    };

    //自定义初始属性类型，并进行类型检查
    static propTypes = {
        initialTitleHTML: PropTypes.string,
        initialContentHTML: PropTypes.string,
        titlePlaceholder: PropTypes.string,
        contentPlaceholder: PropTypes.string,
        editorInitializedCallback: PropTypes.func,
        addCover: PropTypes.func,
        customCSS: PropTypes.string,
        hiddenTitle: PropTypes.bool,
        enableOnChange: PropTypes.bool,
        footerHeight: PropTypes.number,
        contentInset: PropTypes.object
    };

    constructor(props) {
        super(props);
        this._sendAction = this._sendAction.bind(this);
        this.registerToolbar = this.registerToolbar.bind(this);
        this.onBridgeMessage = this.onBridgeMessage.bind(this);
        this._onKeyboardWillShow = this._onKeyboardWillShow.bind(this);
        this._onKeyboardWillHide = this._onKeyboardWillHide.bind(this);
        this.state = {
            selectionChangeListeners: [],
            onChange: [],
            showLinkDialog: false,
            showPlayAudioModal: false,
            audioUrl: '',
            linkInitialUrl: "",
            linkTitle: "",
            linkUrl: "",
            keyboardHeight: 0
        };
        this.currentStartPlayUrl = null;
        this._selectedTextChangeListeners = [];
    }

    componentWillMount() {
        if (PlatformIOS) {
            this.keyboardEventListeners = [
                Keyboard.addListener("keyboardWillShow", this._onKeyboardWillShow),
                Keyboard.addListener("keyboardWillHide", this._onKeyboardWillHide)
            ];
        } else {
            this.keyboardEventListeners = [
                Keyboard.addListener("keyboardDidShow", this._onKeyboardWillShow),
                Keyboard.addListener("keyboardDidHide", this._onKeyboardWillHide)
            ];
        }
    }

    componentDidMount() {
        this.styleSubscription = RCTDeviceEventEmitter.addListener("updateStyle", (style)=> {
            switch (parseInt(style)) {
                case 0: //正文
                        // this.richtext.removeFormat(); //移除格式
                    this.setZWing();
                    break;
                case 1: //一级标题
                    this.heading1()
                    break;
                case 2: //二级标题
                    this.heading2()
                    break;
                case 3: //三级标题
                    this.heading3()
                    break;
                case 4: //列表
                    this.insertBulletsList();
                    break;
                case 5: //设置文本库标签名
                    this.setBlockquote();
                    break;
                default:
                    break;
            }
        });

        this.colorSubscription = RCTDeviceEventEmitter.addListener("updateColor", (event)=> {
            const  {udpateColorType, color} = event;
            if(udpateColorType === 'textColor'){
                this.setTextColor(color);
            }else{
                this.setBackgroundColor(color);
            }

        });
    }
    componentWillUnmount() {
        this.keyboardEventListeners.forEach(eventListener =>
            eventListener.remove()
        );

        this.styleSubscription && this.styleSubscription.remove();
        this.colorSubscription && this.colorSubscription.remove()

    }

    _onKeyboardWillShow(event) {
        console.log("!!!!", event);
        // this.setShowKeyboard(true);
        const newKeyboardHeight = event.endCoordinates.height;
        if (this.state.keyboardHeight === newKeyboardHeight) {
            return;
        }
        if (newKeyboardHeight) {
            this.setEditorAvailableHeightBasedOnKeyboardHeight(newKeyboardHeight);
        }

        this.setState({keyboardHeight: newKeyboardHeight});
    }

    _onKeyboardWillHide(event) {
        this.blurTitleEditor();
        this.blurContentEditor();

        this.setState({keyboardHeight: 0});
    }

    //当键盘显示时，调整文本编辑器的高度
    setEditorAvailableHeightBasedOnKeyboardHeight(keyboardHeight) {
        const {top = 0, bottom = 0} = this.props.contentInset;
        const {marginTop = 0, marginBottom = 0} = this.props.style;
        const spacing = marginTop + marginBottom + top + bottom;

        const editorAvailableHeight = Dimensions.get("window").height - keyboardHeight - spacing;
        // this.setEditorHeight(editorAvailableHeight);
    }

    _startAudio(audio) {
        //1, 先下载音频文件 2. 播放音频文件
        File.download(audio).then(result => {
            if (result.status === "success") {
                Audio.startPlay(result.fileName, playResult => {
                    if (playResult.status === "success") {
                        //开始播放
                        console.log("====================================");
                        console.log("开始播放： ", playResult);
                        console.log("====================================");
                        this.currentStartPlayUrl = audio;
                        //修改HTML5中的音频图标
                    } else if (playResult.status === "complete") {
                        //播放完成
                        console.log("====================================");
                        console.log("播放完成： ", playResult);
                        console.log("====================================");
                        //修改HTML5中的音频图标
                        this.currentStartPlayUrl = null;
                    }
                });
            } else {
                console.log("====================================");
                console.log("文件下载失败 ", result);
                console.log("====================================");
            }
        });
    }

    _stopAudio(audio) {
        Audio.stopPlay();
    }

    _action_audio_touch(audio) {
        //播放音频或者暂停正在播放的音频
        //1.点击的音频文件正在播放，停止播放
        //2.如果有音频文件正在播放，点击下一个音频文件，停止正在播放的音频文件，播放当前的音频文件

        console.log('====================================');
        console.log('点击的音频文件', audio);
        console.log('====================================');
        if (this.currentStartPlayUrl) {
            if (this.currentStartPlayUrl === audio) {
                //点击的音频文件正在播放，进行暂停
                Audio.stopPlay();
                console.log('====================================');
                console.log('停止正在播放的文件');
                console.log('====================================');
                this.currentStartPlayUrl = null;
            } else {
                console.log('====================================');
                console.log('停止正在播放的文件，播放下一个文件');
                console.log('====================================');

                // Audio.stopPlay();
                // this.currentStartPlayUrl=null;
                // this._startAudio(audio);
            }


        } else {
            this._startAudio(audio);
            console.log('====================================');
            console.log('开发播放');
            console.log('====================================');
        }
    }

    //接收WebView发送事件到RN
    onBridgeMessage(str) {
        try {
            const message = JSON.parse(str);
            switch (message.type) {
                case messages.TITLE_HTML_RESPONSE:
                    if (this.titleResolve) {
                        this.titleResolve(message.data);
                        this.titleResolve = undefined;
                        this.titleReject = undefined;
                        if (this.pendingTitleHtml) {
                            clearTimeout(this.pendingTitleHtml);
                            this.pendingTitleHtml = undefined;
                        }
                    }
                    break;
                case messages.TITLE_TEXT_RESPONSE:
                    if (this.titleTextResolve) {
                        this.titleTextResolve(message.data);
                        this.titleTextResolve = undefined;
                        this.titleTextReject = undefined;
                        if (this.pendingTitleText) {
                            clearTimeout(this.pendingTitleText);
                            this.pendingTitleText = undefined;
                        }
                    }
                    break;
                case messages.CONTENT_HTML_RESPONSE:
                    if (this.contentResolve) {
                        this.contentResolve(message.data);
                        this.contentResolve = undefined;
                        this.contentReject = undefined;
                        if (this.pendingContentHtml) {
                            clearTimeout(this.pendingContentHtml);
                            this.pendingContentHtml = undefined;
                        }
                    }
                    break;
                case messages.SELECTED_TEXT_RESPONSE:
                    if (this.selectedTextResolve) {
                        this.selectedTextResolve(message.data);
                        this.selectedTextResolve = undefined;
                        this.selectedTextReject = undefined;
                        if (this.pendingSelectedText) {
                            clearTimeout(this.pendingSelectedText);
                            this.pendingSelectedText = undefined;
                        }
                    }
                    break;
                case messages.ZSS_INITIALIZED: //HTML初始化完成以后，发送消息给RN
                    if (this.props.customCSS) {
                        this.setCustomCSS(this.props.customCSS);
                    }
                    this.setTitlePlaceholder(this.props.titlePlaceholder); //初始化默认标题
                    this.setContentPlaceholder(this.props.contentPlaceholder); //初始化默认内容
                    this.setTitleHTML(this.props.initialTitleHTML); //初始化HTML格式的标题
                    this.setContentHTML(this.props.initialContentHTML); //初始化HTML格式的内容

                    this.props.hiddenTitle && this.hideTitle();
                    this.props.enableOnChange && this.enableOnChange();

                    this.props.editorInitializedCallback &&
                    this.props.editorInitializedCallback();

                    break;
                case messages.LINK_TOUCHED: //点击webView中链接时，通知RN修改链接地址

                    this.prepareInsert();

                    const {title, url, type} = message.data;

                    if (type === 'imga') {
                        this.BrowseImagesModal.showOriginImage(url);
                    } else if (type === 'audio') {

                        // this._action_audio_touch(url);
                    } else {
                        //显示添加超链接modal
                        this.LinkModal.showLinkDialog(title, url)
                    }

                    break;
                case messages.AUDIO_TOUCHED:
                    // this.prepareInsert();
                    // const {audio} = message.data;
                    // this._action_audio_touch(audio);
                    break;
                case messages.IMG_TOUCHED: //点击webView中img时，通知RN修改链接地址
                    // this.prepareInsert();
                    // const {img_title, img_url} = message.data;
                    break;
                case messages.LOG:
                    console.log("HTML5 - > 日志信息 = ", message.data);
                    break;
                case messages.ADD_COVER: //接受webview发送到RN，插入封面图标的事件
                    this.props.addCover();
                    break;
                case messages.SCROLL: //html自动滚动时，回调该方法
                    console.log('====================================');
                    console.log(' y 轴 滚动 = ', message.data);
                    console.log('====================================');
                    this.webviewBridge.setNativeProps({
                        contentOffset: {y: message.data}
                    });
                    break;
                case messages.TOUCH_MOVE: //通过手势移动HTML时，隐藏键盘
                    console.log("============ TOUCH_MOVE==========dismiss");
                    // this.props.changeActionBoxState(false);
                    break;
                case messages.TITLE_FOCUSED: //标题获取焦点
                    this.titleFocusHandler && this.titleFocusHandler();
                    this.props.changeActionBoxState(false); //隐藏底部操作栏
                    break;
                case messages.CONTENT_FOCUSED: //内容获取焦点
                    this.contentFocusHandler && this.contentFocusHandler();
                    this.props.changeActionBoxState(true);//显示底部操作栏
                    break;
                case messages.SELECTION_CHANGE: { //发送消息给RN，告知当前选中的内容样式类型
                    // const items = message.data.items;
                    // this.state.selectionChangeListeners.map(listener => {
                    //   listener(items);
                    // });
                    break;
                }
                case messages.CONTENT_CHANGE: {
                    const content = message.data.content;
                    this.state.onChange.map(listener => listener(content));
                    break;
                }
                case messages.SELECTED_TEXT_CHANGED: {
                    const selectedText = message.data;
                    this._selectedTextChangeListeners.forEach(listener => {
                        listener(selectedText);
                    });
                    break;
                }
            }
        } catch (e) {
            //alert('NON JSON MESSAGE');
        }
    }

    /**
     * 添加和更新超链接
     */
    onPressAddLink() {
        this.getSelectedText().then(selectedText => {
            this.LinkModal.showLinkDialog(selectedText, '')
        });
    }


    /**
     * 关闭并停止播放音频文件
     * @private
     */
    _closePlayAudioModal() {
        this.setState({
            showPlayAudioModal: false,
            audioUrl: ""
        });
        this._stopAudio();
    }

    _renderLinkModal() {
        const _add_link_props = {
            insertLink: (url, title) => this.insertLink(url, title),
            updateLink: (url, title) => this.updateLink(url, title),
        }

        return (
            <View>

                <View>
                    {/*添加超链接的图层*/}
                    <LinkModal ref={(r) => (this.LinkModal = r)}  {..._add_link_props} />
                </View>
                <View>
                    {/*添加超链接的图层*/}
                    <BrowseImagesModal ref={(r) => (this.BrowseImagesModal = r)}/>
                </View>

            </View>
        );
    }


    render() {
        const pageSource = PlatformIOS? require("./editor.html") : {uri: "file:///android_asset/editor.html"};
        return (
            <View style={{flex: 1}}>
                <WebViewBridge
                    {...this.props}
                    hideKeyboardAccessoryView={true}
                    keyboardDisplayRequiresUserAction={false}
                    ref={r => {
                        this.webviewBridge = r;
                    }}
                    onBridgeMessage={message => this.onBridgeMessage(message)}
                    injectedJavaScript={injectScript}
                    source={pageSource}
                    onLoad={() => this.init()}
                    automaticallyAdjustContentInsets={true}

                />

                {this._renderLinkModal()}
            </View>
        );
    }

    escapeJSONString = function (string) {
        return string
            .replace(/[\\]/g, "\\\\")
            .replace(/[\"]/g, '\\"')
            .replace(/[\']/g, "\\'")
            .replace(/[\/]/g, "\\/")
            .replace(/[\b]/g, "\\b")
            .replace(/[\f]/g, "\\f")
            .replace(/[\n]/g, "\\n")
            .replace(/[\r]/g, "\\r")
            .replace(/[\t]/g, "\\t");
    };

    _sendAction(action, data) {
        let jsonString = JSON.stringify({type: action, data});
        jsonString = this.escapeJSONString(jsonString);
        this.webviewBridge.sendToBridge(jsonString);
    }

    //-------------------------------------------------------------------------------
    //--------------- Public API


    focusTitle() {
        this._sendAction(actions.focusTitle);
    }

    focusContent() {
        this._sendAction(actions.focusContent);
    }

    registerToolbar(listener) {
        this.setState({
            selectionChangeListeners: [
                ...this.state.selectionChangeListeners,
                listener
            ]
        });
    }

    enableOnChange() {
        this._sendAction(actions.enableOnChange);
    }

    setTitleHTML(html) {
        this._sendAction(actions.setTitleHtml, html);
    }

    hideTitle() {
        this._sendAction(actions.hideTitle);
    }

    showTitle() {
        this._sendAction(actions.showTitle);
    }

    setContentHTML(html) {
        this._sendAction(actions.setContentHtml, html);
    }

    blurTitleEditor() {
        this._sendAction(actions.blurTitleEditor);
    }

    blurContentEditor() {
        this._sendAction(actions.blurContentEditor);
    }

    heading1() {
        this._sendAction(actions.heading1);
    }

    heading2() {
        this._sendAction(actions.heading2);
    }

    heading3() {
        this._sendAction(actions.heading3);
    }

    heading4() {
        this._sendAction(actions.heading4);
    }

    heading5() {
        this._sendAction(actions.heading5);
    }

    heading6() {
        this._sendAction(actions.heading6);
    }

    setParagraph() {
        this._sendAction(actions.setParagraph);
    }

    removeFormat() {
        this._sendAction(actions.removeFormat);
    }

    setZWing() {
        this._sendAction(actions.setZWing);
    }

    setBlockquote() {
        this._sendAction(actions.setBlockquote);
    }


    insertBulletsList() {
        this._sendAction(actions.insertBulletsList);
    }

    insertOrderedList() {
        this._sendAction(actions.insertOrderedList);
    }

    insertLink(url, title) {
        this._sendAction(actions.insertLink, {url, title});
    }

    insertTable(rows, cols) {
        this.prepareInsert();
        this._sendAction(actions.insertTable, {rows, cols});
    }

    insertEmbed(embed) {
        this.prepareInsert();
        this._sendAction(actions.insertEmbed, embed);
    }

    updateLink(url, title) {
        this._sendAction(actions.updateLink, {url, title});
    }

    insertImage(attributes) {
        this.prepareInsert();
        this._sendAction(actions.insertImage, attributes);
    }

    insertAudio(attributes) {
        this.prepareInsert();
        this._sendAction(actions.insertAudio, attributes);
    }

    //插入封面图标
    insertCoverImage(attributes) {
        this.prepareInsert();
        this._sendAction(actions.insertCoverImage, attributes);
    }

    setBackgroundColor(color) {
        this._sendAction(actions.setBackgroundColor, color);
    }

    setTextColor(color) {
        this._sendAction(actions.setTextColor, color);
    }

    setTitlePlaceholder(placeholder) {
        this._sendAction(actions.setTitlePlaceholder, placeholder);
    }

    setContentPlaceholder(placeholder) {
        this._sendAction(actions.setContentPlaceholder, placeholder);
    }

    setCustomCSS(css) {
        this._sendAction(actions.setCustomCSS, css);
    }

    prepareInsert() {
        this._sendAction(actions.prepareInsert);
    }


    init() {
        this._sendAction(actions.init);
        this.setPlatform();
        if (this.props.footerHeight) {
            this.setFooterHeight();
        }
    }

    setEditorHeight(height) {
        this._sendAction(actions.setEditorHeight, height);
    }

    setFooterHeight() {
        this._sendAction(actions.setFooterHeight, this.props.footerHeight);
    }

    setPlatform() {
        this._sendAction(actions.setPlatform, Platform.OS);
    }

    async getTitleHtml() {
        return new Promise((resolve, reject) => {
            this.titleResolve = resolve;
            this.titleReject = reject;
            this._sendAction(actions.getTitleHtml);

            this.pendingTitleHtml = setTimeout(() => {
                if (this.titleReject) {
                    this.titleReject("timeout");
                }
            }, 5000);
        });
    }

    async getTitleText() {
        return new Promise((resolve, reject) => {
            this.titleTextResolve = resolve;
            this.titleTextReject = reject;
            this._sendAction(actions.getTitleText);

            this.pendingTitleText = setTimeout(() => {
                if (this.titleTextReject) {
                    this.titleTextReject("timeout");
                }
            }, 5000);
        });
    }

    async getContentHtml() {
        return new Promise((resolve, reject) => {
            this.contentResolve = resolve;
            this.contentReject = reject;
            this._sendAction(actions.getContentHtml);

            this.pendingContentHtml = setTimeout(() => {
                if (this.contentReject) {
                    this.contentReject("timeout");
                }
            }, 5000);
        });
    }

    async getSelectedText() {
        return new Promise((resolve, reject) => {
            this.selectedTextResolve = resolve;
            this.selectedTextReject = reject;
            this._sendAction(actions.getSelectedText);

            this.pendingSelectedText = setTimeout(() => {
                if (this.selectedTextReject) {
                    this.selectedTextReject("timeout");
                }
            }, 5000);
        });
    }

    setTitleFocusHandler(callbackHandler) {
        this.titleFocusHandler = callbackHandler;
        this._sendAction(actions.setTitleFocusHandler);
    }

    setContentFocusHandler(callbackHandler) {
        this.contentFocusHandler = callbackHandler;
        this._sendAction(actions.setContentFocusHandler);
    }

    addSelectedTextChangeListener(listener) {
        this._selectedTextChangeListeners.push(listener);
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
