import React, {Component, PropTypes} from "react";
import {
    ListView,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Text,
    Dimensions,
    Keyboard
} from "react-native";
import {actions} from "./const";
import StyleModal from "./StyleModal";
import ColorStyleModal from "./ColorStyleModal";
import BgColorStyleModal from './BgColorStyleModal'
import AudioStyleModal from "./AudioStyleModal";
import BaseComponent from './BaseComponent'


const defaultActions = [
    actions.insertImage,
    actions.insertAudio,
    actions.setBold,
    actions.setItalic,
    actions.box_style,
    actions.box_text_color,
    actions.box_background_color,
    actions.insertLink,
    actions.setHR,

];

function getDefaultIcon() {
    const texts = {};
    texts[actions.insertImage] = "插图";
    texts[actions.insertAudio] = '音频';
    texts[actions.setBold] = "加粗";
    texts[actions.setItalic] = "斜体";
    texts[actions.box_style] = "样式";
    texts[actions.box_text_color] = "文色";
    texts[actions.box_background_color] = "背色";

    texts[actions.insertLink] = "链接";
    //插入水平线
    texts[actions.setHR] = "水平线";

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
            styleModalShow: false,
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
        return actions.map(action => {
            return {action, selected: selectedItems.includes(action)};
        });
    }

    _renderAction(action, selected) {
        const icon = getDefaultIcon()[action];
        return (
            <TouchableOpacity
                key={action}
                style={[
                    {
                        height: 50,
                        width: 50
                    }
                ]}
                onPress={() => this._onPress(action)}
            >
                <View
                    style={{
                        height: 50,
                        width: 50,
                        justifyContent: "center",
                        alignItems: "flex-start"
                    }}
                >
                    <Text
                        style={{
                            textAlign: "center",
                            color: selected ? this.props.selectedIconTint
                                : this.props.iconTint
                        }}
                    >
                        {icon}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    render() {

        return (
            <View style={{flexDirection: 'column'}}>
                <View
                    style={[
                        {

                            backgroundColor: "#EEEEEE",
                            alignItems: "center",
                            flexDirection: "column"
                        },
                        this.props.style
                    ]}
                >
                    <ListView
                        horizontal
                        contentContainerStyle={{
                            flexDirection: "row",
                            marginLeft: 10
                        }}
                        dataSource={this.state.ds}
                        renderRow={row => this._renderAction(row.action, row.selected)}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>


                <View>
                   <StyleModal ref={r => (this.StyleModal = r) } getEditor={() => this.props.getEditor()} keyboardHeight={260}  />
                    <ColorStyleModal ref={r => (this.ColorStyleModal = r)} getEditor={() => this.props.getEditor()}/>
                    <BgColorStyleModal ref={r => (this.BgColorStyleModal = r)} getEditor={() => this.props.getEditor()}/>
                    <AudioStyleModal ref={r => (this.AudioStyleModal = r)} getEditor={() => this.props.getEditor()}/>
                </View>

            </View>
        );
    }

    changeStyleModalWithFocus(){
        this.StyleModal._change_modal_state(true)
        this.ColorStyleModal._change_modal_state(true)
        this.BgColorStyleModal._change_modal_state(true)
        this.AudioStyleModal._change_modal_state(true)
    }
    _onPress(action) {
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
                if (this.props.onPressAddLink) {
                    this.props.onPressAddLink();
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
    defaultUnselectedButton: {}
});
