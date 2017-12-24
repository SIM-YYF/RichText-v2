/**
 * Created by sunyan on 2017/3/20.
 */

import React, { Component } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    Platform
} from 'react-native';

import loadingImage from '../img/loading.gif'
const { width, height } = Dimensions.get('window')
let miOverlay ;
import RootSiblings from 'react-native-root-siblings';
export default class LoadingView {
    static show() {
        if (miOverlay !== undefined) {
           this.hide();
        }
        miOverlay =  new RootSiblings(<LoadingViewIndicator />);
    }

    static hide() {
        if (miOverlay instanceof RootSiblings) {
            miOverlay.destroy();
        } else {
            //console.log(`Toast.hide expected a \`RootSiblings\` instance as argument.\nBut got \`${typeof toast}\` instead.`);
        }
    }
}

 class LoadingViewIndicator extends Component{
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Animated.View style={{backgroundColor: 'rgba(0, 0, 0, 0.4)',marginTop:Platform.OS==='ios'?64:44,position:'absolute',
                height:Platform.OS==='ios'?height-64:height-44, width: width,alignItems: 'center', justifyContent: 'center'}}>
                <View style={ styles.loadingImageView }>
                    <View style={ styles.loadingImage }>
                        {
                            this.props.loadingViewClick?
                                <TouchableOpacity onPress={ this.props.loadingViewClick }>
                                    <Image style={ styles.loadingImage } source={ loadingImage }/>
                                </TouchableOpacity>
                                :
                                <Image style={ styles.loadingImage } source={ loadingImage }/>
                        }
                    </View>
                </View>
            </Animated.View>


        )
    }
}



const styles = StyleSheet.create({
    loadingView: {
        flex: 1,
        height,
        width,
        position: 'absolute'
    },
    loadingImage: {
        width: 80,
        height: 80,
    },
    loadingImageView: {
        backgroundColor:'transparent',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        height:Platform.OS==='ios'?height-64:height-44,
        width,
    }
})
LoadingView.propTypes = {
    loadingViewClick: React.PropTypes.func, //.isRequired,
    showLoading: React.PropTypes.bool,
    opacity: React.PropTypes.number,
    backgroundColor: React.PropTypes.string
};



