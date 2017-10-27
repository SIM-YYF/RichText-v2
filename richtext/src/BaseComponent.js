/**
 * Created by fly on 2017/10/27.
 */

import React, {Component} from 'react';
import {
    Platform,
    Keyboard

} from 'react-native';

export default class BaseComponent extends Component {

    constructor(props) {
        super(props);

        const updateListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const resetListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        this._listeners = [
            Keyboard.addListener(updateListener, this.keyboardWillShow.bind(this)), //显示监听
            Keyboard.addListener(resetListener, this.keyboardWillHide.bind(this))  //隐藏监听
        ];
    }

    keyboardWillShow(event) {
        this.keyboardHeight = event.endCoordinates.height;
    }

    keyboardWillHide(event) {

    }

    componentWillUnmount() {
        this._listeners.forEach(listener => listener.remove());
    }

}

