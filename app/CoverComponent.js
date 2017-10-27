//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import Screen from "./ScreenFlex";
// 添加封面的组件
class CoverComponent extends Component {
    constructor(params) {
        super(params);

    }

     _add_cover_press = () => {
        // body
    }

    render() {
        return (
            <View style={[styles._gen,styles.container,]}>
               
               <View 
                style = {[styles._gen, styles._cover_container]}
               >

               <TouchableHighlight
                style = {
                    [styles._gen, styles.add_cover_btn]
                }
                underlayColor = {'#C0C0C0'}
                onPress = {this._add_cover_press}
               >

                <Text style = {styles.add_cover_txt}>添加封面</Text>
               </TouchableHighlight>
               
               </View>
            </View>
        );
    }
}

// define your styles
const styles = StyleSheet.create({

    _gen:{
       
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: Screen.screenWidth,
        height: 150,
        backgroundColor: '#C0C0C0',

    },

    _cover_container: {
        width: Screen.screenWidth / 2.5,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderColor: 'red',
        borderRadius:12,
        borderWidth:0.5,
        borderStyle:'dashed',

    },

    add_cover_btn:{
        width:80,  
        height:40,  
        borderWidth:1,  
        backgroundColor:"#DDDDDD",  
        borderColor:'#DDDDDD',
        borderRadius:8,  
        elevation:100  
    },

    add_cover_txt:{
        fontSize:12,
    }
});

//make this component available to the app
export default CoverComponent;
