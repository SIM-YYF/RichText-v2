/**
 * Created by sunyan on 2017/5/8.
 */
import Toast from 'react-native-root-toast';

let toast = null;
let hideTimer = null;
/**
 * 冒一个时间比较短的Toast
 * @param content
 */
export const toastShort = (content) => {
    if (toast !== undefined) {
        Toast.hide(toast);
    }
    hideTimer && clearTimeout(hideTimer);
    toast = Toast.show(content.toString(), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
    });
};

export function toastShortBottom(content) {
    if (toast !== undefined) {
        Toast.hide(toast);
    }
    hideTimer && clearTimeout(hideTimer);
    toast = Toast.show(content.toString(), {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
    });
}

/**
 * 冒一个时间比较久的Toast
 * @param content
 */
export const toastLong = (content) => {
    if (toast !== undefined) {
        Toast.hide(toast);
    }
    hideTimer && clearTimeout(hideTimer);
    toast = Toast.show(content.toString(), {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0
    });
};

export const toastMessage = (content, options={}) => {
    if (toast !== undefined) {
        Toast.hide(toast);
    }
    hideTimer && clearTimeout(hideTimer);
    options = {
        autoHide: true,
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        ...options,
    };
    toast = Toast.show(content.toString(), options);
    if(options.autoHide) {
        hideTimer = setTimeout(()=>{
            Toast.hide(toast);
        }, options.duration+1);
    }
};

