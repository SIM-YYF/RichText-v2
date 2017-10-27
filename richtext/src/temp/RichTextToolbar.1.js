import React, { Component, PropTypes } from "react";
import {
  ListView,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text
} from "react-native";
import { actions } from "./const";

const defaultActions = [
  actions.insertImage,
  actions.setBold,
  actions.setItalic,
  actions.insertBulletsList,
  actions.insertOrderedList,
  actions.insertLink,
  actions.heading1,
  actions.heading2,
  actions.heading3,

  actions.setBackgroundColor,
  actions.setTextColor,
  actions.setStrikethrough,

  actions.setIndent,
  actions.setOutdent,
  actions.setUnderline,
  actions.setHR,
  actions.setParagraph,
  actions.setSubscript,
  actions.setSuperscript,
  actions.insertTable,
  actions.insertEmbed
];

function getDefaultIcon() {
  const texts = {};

  // texts[actions.insertImage] = require('../img/icon_format_media.png');
  // texts[actions.setBold] = require('../img/icon_format_bold.png');
  // texts[actions.setItalic] = require('../img/icon_format_italic.png');
  // texts[actions.insertBulletsList] = require('../img/icon_format_ul.png');
  // texts[actions.insertOrderedList] = require('../img/icon_format_ol.png');
  // texts[actions.insertLink] = require('../img/icon_format_link.png');

  texts[actions.insertImage] = "插图";
  texts[actions.setBold] = "加粗";
  texts[actions.setItalic] = "斜体";
  texts[actions.insertBulletsList] = "无序";
  texts[actions.insertOrderedList] = "有序";
  texts[actions.insertLink] = "链接";

  //一级标题
  texts[actions.heading1] = "Head1";
  //二级标题
  texts[actions.heading2] = "Head2";
  //三级标题
  texts[actions.heading3] = "Head3";

  //设置文本的背景颜色
  texts[actions.setBackgroundColor] = "背景颜色";
  //设置文本的字体颜色
  texts[actions.setTextColor] = "字体颜色";
  //设置删除线
  texts[actions.setStrikethrough] = "删除线";

  //缩进
  texts[actions.setIndent] = "缩进";
  //减少缩进量
  texts[actions.setOutdent] = "减少缩进";

  //插入段落
  texts[actions.setParagraph] = "段落";

  //插入水平线
  texts[actions.setHR] = "水平线";

  //设置下横线
  texts[actions.setUnderline] = "下横线";

  texts[actions.setSubscript] = "上角标";
  texts[actions.setSuperscript] = "下角标";

  //插入表格
  texts[actions.insertTable] = "表格";

  //插入视频
  texts[actions.insertEmbed] = "视频";

  return texts;
}

export default class RichTextToolbar extends Component {
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

    //工具栏中，视图渲染的动作。 两种类型：一种，用户自定义，通过Props传递过来。另外一种就是：采用默认定义的类型。
    const actions = this.props.actions ? this.props.actions : defaultActions;
    this.state = {
      editor: undefined,
      selectedItems: [],
      actions,
      ds: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }).cloneWithRows(this.getRows(actions, []))
    };
  }

  componentDidReceiveProps(newProps) {
    const actions = newProps.actions ? newProps.actions : defaultActions;
    this.setState({
      actions,
      ds: this.state.ds.cloneWithRows(
        this.getRows(actions, this.state.selectedItems)
      )
    });
  }

  getRows(actions, selectedItems) {
    return actions.map(action => {
      return { action, selected: selectedItems.includes(action) };
    });
  }

  //让ToolBar挂载编辑器
  componentDidMount() {
    const editor = this.props.getEditor();
    if (!editor) {
      throw new Error("Toolbar has no editor!");
    } else {
      //将工具栏注册到编译器中
      editor.registerToolbar(selectedItems =>
        this.setSelectedItems(selectedItems)
      );
      this.setState({ editor });
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

  _getButtonSelectedStyle() {
    return this.props.selectedButtonStyle
      ? this.props.selectedButtonStyle
      : styles.defaultSelectedButton;
  }

  _getButtonUnselectedStyle() {
    return this.props.unselectedButtonStyle
      ? this.props.unselectedButtonStyle
      : styles.defaultUnselectedButton;
  }

  _getButtonIcon(action) {
    if (this.props.iconMap && this.props.iconMap[action]) {
      return this.props.iconMap[action];
    } else if (getDefaultIcon()[action]) {
      return getDefaultIcon()[action];
    } else {
      return undefined;
    }
  }

  _defaultRenderAction(action, selected) {
    const icon = this._getButtonIcon(action);
    return (
      <TouchableOpacity
        key={action}
        style={[
          {
            height: 50,
            width: 50,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center"
          },
          selected
            ? this._getButtonSelectedStyle()
            : this._getButtonUnselectedStyle()
        ]}
        onPress={() => this._onPress(action)}
      >
        {/* {icon ? 
        <Image source={icon} style={{tintColor: selected ? this.props.selectedIconTint : this.props.iconTint}}/> 
        : 
        <Text style={{color:'#000', fontWeight: 'bold'}}>{icon}</Text>
        
        } */}

        {icon ? (
          <View
            style={{
              height: 50,
              width: 50,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: selected
                  ? this.props.selectedIconTint
                  : this.props.iconTint
              }}
            >
              {icon}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }

  _renderAction(action, selected) {
    return this.props.renderAction
      ? this.props.renderAction(action, selected)
      : this._defaultRenderAction(action, selected);
  }

  render() {
    return (
      <View
        style={[
          { height: 50, backgroundColor: "#D3D3D3", alignItems: "center" },
          this.props.style
        ]}
      >
        <ListView
          horizontal
          contentContainerStyle={{ flexDirection: "row" }}
          dataSource={this.state.ds}
          renderRow={row => this._renderAction(row.action, row.selected)}
        />
      </View>
    );
  }

  _onPress(action) {
    switch (action) {
      case actions.setBold: //开启或关闭选中文字或插入点的粗体字效果
      case actions.setItalic: //在光标插入点开启或关闭斜体字
      case actions.insertBulletsList: //圆点的无序列表
      case actions.insertOrderedList: //数字的有序列表
      case actions.setUnderline: //下横线
      case actions.heading1: //在光标处或者所选文字上,添加一级标题
      case actions.heading2:
      case actions.heading3:
      case actions.heading4:
      case actions.heading5:
      case actions.heading6:
      case actions.setParagraph: //在选择或当前行周围插入一个段落
      case actions.removeFormat:
      case actions.alignLeft: //对光标插入位置或者所选内容进行左对齐
      case actions.alignCenter: //对光标插入位置或者所选内容进行文字居中
      case actions.alignRight: //对光标插入位置或者所选内容进行右对齐
      case actions.alignFull: //对光标插入位置或者所选内容进行文本对齐
      case actions.setSubscript: //在光标插入点开启或关闭下角标。
      case actions.setSuperscript: //在光标插入点开启或关闭上角标。
      case actions.setStrikethrough: //删除线
      case actions.setHR: //在插入点插入一个水平线（删除选中的部分）
      case actions.setIndent: //缩进选择或插入点所在的行
      case actions.setOutdent: // 对光标插入行或者所选行内容减少缩进量
        this.state.editor._sendAction(action);
        break;
      case actions.insertLink: //插入超链接
        this.state.editor.prepareInsert();
        if (this.props.onPressAddLink) {
          this.props.onPressAddLink();
        }
        // } else {
        //   this.state.editor.getSelectedText().then(selectedText => {
        //     if(selectedText){

        //     }
        //     this.state.editor.showLinkDialog(selectedText);
        //   });
        // }
        break;
      case actions.insertImage: //在插入点插入一张图片（删除选中的部分）
        this.state.editor.prepareInsert();
        if (this.props.onPressAddImage) {
          this.props.onPressAddImage();
        }
        break;
      case actions.setBackgroundColor: //设置文本背景色
        if (this.props.setBackgroundColor) {
          this.props.setBackgroundColor();
        }
        break;

      case actions.setTextColor: //设置文字颜色
        if (this.props.setTextColor) {
          this.props.setTextColor();
        }
        break;

      case actions.insertTable: //插入表格
        this.state.editor.prepareInsert();
        if (this.props.insertTable) {
          this.props.insertTable();
        }
        break;
      case actions.insertEmbed: //插入视频
        this.state.editor.prepareInsert();
        if (this.props.insertEmbed) {
          this.props.insertEmbed();
        }
        break;
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
