import React, {Component, PropTypes} from "react";
import {
    ListView,
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    PixelRatio,
    Image,

} from "react-native";
import {actions} from "./const";
import StyleModal from "./styles/StyleModal";
import ColorStyleModal from "./styles/ColorStyleModal";
import BgColorStyleModal from './styles/BgColorStyleModal'
import AudioStyleModal from "./styles/AudioStyleModal";
import BaseComponent from './BaseComponent'


const defaultActions = [
    actions.insertImage,
    actions.insertAudio,
    actions.insertLink,

    actions.setBold,
    actions.setItalic,
    actions.box_text_color,
    actions.box_background_color,
    actions.box_style,
    actions.setHR,

];

function getDefaultIcon() {
    const texts = {};
    texts[actions.insertImage] = {icon: require("../img/icon_add_img.png"), text: "插图"};
    texts[actions.insertAudio] = {icon: require('../img/icon_add_audio.png'), text: '音频'};
    texts[actions.insertLink] = {icon: require('../img/icon_add_link.png'), text: '链接'};


    texts[actions.setBold] = {icon: require('../img/icon_bold.png'), text: '加粗'};
    texts[actions.setItalic] = {icon: require('../img/icon_font_italics.png'), text: '斜体'};
    texts[actions.box_text_color] = {icon: require('../img/icon_font_color.png'), text: '字色'};
    texts[actions.box_background_color] = {icon: require('../img/icon_font_bgcolor.png'), text: '背景色'};
    texts[actions.box_style] = {icon: require('../img/icon_font_styles.png'), text: '样式'};
    texts[actions.setHR] = {icon: require('../img/icon_divider.png'), text: '分割线'};

    return texts;
}

export default class RichTextToolbar extends BaseComponent {
    // 属性的定义和类型验证
    static propTypes = {
        getEditor: PropTypes.func.isRequired,
        actions: PropTypes.array,
        onPressAddLink: PropTypes.func,
        onPressAddImage: PropTypes.func,
        selectedButtonStyle: PropTypes.object,
        iconTint: PropTypes.any,
        selectedIconTint: PropTypes.any,
        unselectedButtonStyle: PropTypes.object,
        renderAction: PropTypes.func,
        iconMap: PropTypes.object
    };

    constructor(props) {
        super(props);

        const actions = this.props.actions ? this.props.actions : defaultActions;
        this.state = {
            editor: undefined,
            actions,
            ds: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2
            }).cloneWithRows(this.getRows(actions, []))
        };


    }


    //让ToolBar挂载编辑器
    componentDidMount() {


        let editor = this.props.getEditor();
        if (!editor) {
            throw new Error("Toolbar has no editor!");
        } else {
            //将工具栏注册到编译器中
            // editor.registerToolbar(selectedItems =>
            //     this.setSelectedItems(selectedItems)
            // );
            this.setState({editor});
        }
    }

    setSelectedItems(selectedItems) {
        if (selectedItems !== this.state.selectedItems) {
            this.setState({
                selectedItems,
                ds: this.state.ds.cloneWithRows(
                    this.getRows(this.state.actions, selectedItems)
                )
            });
        }
    }

    getRows(actions, selectedItems) {
        return actions.map((action, index) => {
            return {action, selected: selectedItems.includes(action), index};
        });
    }

    _renderAction(action, selected, index) {
        const {icon, text} = getDefaultIcon()[action];

        //backgroundImage:url('../img/icon_blue_bar_border.png'),
        const border_left_style = {
            backgroundColor: '#f2faff',

            borderLeftColor: '#dff3ff',
            borderLeftWidth: 0.5,
            borderStyle: "solid",
            borderColor: 'transparent',
        }
        // const diff_icons_style = index > 2 ? (index === 3 ? [styles.diff_icons_container, border_left_style] : [styles.diff_icons_container, {backgroundColor: '#f2faff'}]) : (styles.diff_icons_container);


        return (


            <View style={styles.diff_icons_container}>
                <TouchableOpacity onPress={() => {
                    this._onPress(action)
                }}>
                    <View style={styles.listView_item_container}>
                        <Image style={styles.listView_item_icon} source={icon}></Image>

                        <Text style={styles.listView_item_text}> {text} </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <View >
                <View style={styles.style_listView_container}>

                    <ListView

                        horizontal
                        contentContainerStyle={{
                            flexDirection: "row",
                        }}
                        dataSource={this.state.ds}
                        renderRow={row => this._renderAction(row.action, row.selected, row.index)}
                        showsHorizontalScrollIndicator={false}
                    />
                    <Image style={{height: 70, width: 24, position: 'absolute', right: -5}} source={require('../img/icon_scroll_hint.png')}/>

                </View>

                <View>
                    <StyleModal ref={r => (this.StyleModal = r)} getEditor={() => this.props.getEditor()}
                                keyboardHeight={260}/>
                    <ColorStyleModal ref={r => (this.ColorStyleModal = r)} getEditor={() => this.props.getEditor()}/>
                    <BgColorStyleModal ref={r => (this.BgColorStyleModal = r)}
                                       getEditor={() => this.props.getEditor()}/>
                    <AudioStyleModal ref={r => (this.AudioStyleModal = r)} getEditor={() => this.props.getEditor()}/>
                </View>

            </View>
        );
    }

    changeStyleModalWithFocus() {
        this.StyleModal._change_modal_state(true)
        this.ColorStyleModal._change_modal_state(true)
        this.BgColorStyleModal._change_modal_state(true)
        this.AudioStyleModal._change_modal_state(true)
    }

    _onPress = (action) => {

        switch (action) {
            case actions.insertImage: //在插入点插入一张图片（删除选中的部分）
                this.state.editor.prepareInsert();
                if (this.props.onPressAddImage) {
                    this.props.onPressAddImage();
                }
                break;
            case actions.insertAudio: //在插入音频（删除选中的部分）

                this.StyleModal.hiddenModal()
                this.BgColorStyleModal.hiddenModal()
                this.ColorStyleModal.hiddenModal()

                this.AudioStyleModal._change_modal_state(false);
                // this.state.editor.prepareInsert();
                // if (this.props.insertAudio) {
                //   this.props.insertAudio();
                // }
                break;
            case actions.setBold: //开启或关闭选中文字或插入点的粗体字效果
            case actions.setItalic: //在光标插入点开启或关闭斜体字
                this.state.editor._sendAction(action);
                break;

            case actions.box_style: //修改样式
                //弹窗,选择样式,同时隐藏文色和背景色图层
                this.AudioStyleModal.hiddenModal()
                this.ColorStyleModal.hiddenModal()
                this.BgColorStyleModal.hiddenModal()
                this.StyleModal._change_modal_state(false);
                break;

            case actions.box_text_color: //修改字体颜色
                //弹窗，选择样式
                this.AudioStyleModal.hiddenModal()
                this.StyleModal.hiddenModal()
                this.BgColorStyleModal.hiddenModal()
                this.ColorStyleModal._change_modal_state(false, "textColor");
                break;
            case actions.box_background_color: //修改字体背景颜色
                //弹窗，选择样式
                this.AudioStyleModal.hiddenModal()
                this.StyleModal.hiddenModal()
                this.ColorStyleModal.hiddenModal();
                this.BgColorStyleModal._change_modal_state(false, "backgroundColor");

                break;
            case actions.insertLink: //添加超链接
                this.state.editor.prepareInsert();
                if (this.state.editor.onPressAddLink) {
                    this.state.editor.onPressAddLink();
                }
                break;
            case actions.setHR: //插入分隔线
                this.state.editor._sendAction(action);
                break;
        }
    }
}

const styles = StyleSheet.create({
    defaultSelectedButton: {
        backgroundColor: "red"
    },
    defaultUnselectedButton: {},


    style_listView_container: {
        // backgroundColor: "#FFFFFF",
        flexDirection: "row",
        borderTopColor: '#C1C1C1',
        borderBottomColor: '#C1C1C1',
        borderTopWidth: 1,
        borderBottomWidth: 1,

    },

    diff_icons_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'#ffffff',
    },

    listView_item_container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:8,
        marginBottom:8,
        marginLeft:10,
        marginRight:10,

    },
    listView_item_icon: {
        justifyContent: "center",
        alignItems: "center",
        height: 20,
        width: 20,

    },
    listView_item_text: {
        textAlign: "center",
        fontSize: 10,
        color: '#8e8e8e',
        marginTop: 5,

    },


});
