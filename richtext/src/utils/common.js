/**
 * Created by mahongwei on 2017/9/27.
 */
import {Platform, Image, PermissionsAndroid} from 'react-native';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Sound from 'react-native-sound';
const Permissions = require('react-native-permissions');
const RNFS = require('react-native-fs');

export const downloadPath = AudioUtils.DownloadsDirectoryPath;
export const audioPath = AudioUtils.DocumentDirectoryPath + '/audio';
export const imagePath = AudioUtils.DocumentDirectoryPath + '/image';
RNFS.exists(audioPath).then(exist => {
    if (!exist) {
        RNFS.mkdir(audioPath);
    }
});
RNFS.exists(imagePath).then(exist => {
    if (!exist) {
        RNFS.mkdir(audioPath);
    }
});

export function getImageSize(image, maxWidth=0, maxHeight=0) {
    return new Promise(resolve => {
        Image.getSize(image, (img_width, img_height) => {
            resolve(getScaleSize(img_width, img_height, maxWidth, maxHeight));
        });
    });
}

export function getScaleSize(originW, originH, maxWidth=0, maxHeight=0) {
    let width = originW;
    let height = originH;
    let scaleW = 1;
    let scaleH = 1;
    if(maxWidth > 0 && width > maxWidth) {
        scaleW = maxWidth / width;
    }
    if(maxHeight > 0 && height > maxHeight) {
        scaleH = maxHeight / height;
    }
    const scale = scaleW > scaleH ? scaleH : scaleW;
    width *= scale;
    height *= scale;
    return {width, height};
}
/**
 * UUID，唯一标识
 * */
export function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getFileNameFromFileURL(url="") {
    const urlComponents = url.split('/');
    return urlComponents[urlComponents.length - 1];
}

export const Audio = (function () {
    let _recordSuccess = null; // 录音完成后回调
    let _play_instance = null; // 播放实例
    // 监听录音完成iOS
    let _record_begin_time = 0;
    let _record_end_time = 0;
    AudioRecorder.onFinished = (data) => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
            _finishRecord(data);
        }
    };
    // 录音完成
    function _finishRecord(data) {
        const voice_len = _record_end_time - _record_begin_time;
        if(voice_len < 200) {
            data = {status: 'failed', message: '录音时长太短!'}
        }
        if (_recordSuccess && typeof _recordSuccess === "function") {
            _recordSuccess({...data, voice_len: voice_len / 1000});
        }
        _recordSuccess = null;
    }

    async function _record(callback) {
        const file_path = audioPath + '/' + uuid() + '.aac';
        AudioRecorder.prepareRecordingAtPath(file_path, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            MeteringEnabled: true,
            AudioEncodingBitRate: 32000
        });
        try {
            _record_begin_time = Date.now();
            await AudioRecorder.startRecording();
            if (callback && typeof callback === "function") {
                callback({status: 'success'});
            }
        } catch (error) {
            if (callback && typeof callback === "function") {
                callback({status: 'failed', message: '录音失败'});
            }
        }
    }

    function _startRecord(callback) {
        _record_begin_time = Date.now();
        _recordSuccess = null;
        if(Platform.OS === 'ios') {
            Permissions.check('microphone').then(response => {
                if (response !== 'authorized' && response !== 'undetermined') {
                    if (callback && typeof callback === "function") {
                        callback({status: 'failed', message: '没有录音权限,请在设置里打开录音权限'});
                    }
                } else {
                    return _record(callback);
                }
            });
        } else {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).then(result => {
                if (result === true || result === PermissionsAndroid.RESULTS.GRANTED) {
                    return _record(callback);
                } else {
                    if (callback && typeof callback === "function") {
                        callback({status: 'failed', message: '没有录音权限,请在设置里打开录音权限'});
                    }
                }
            })
        }
    }

    async function _stopRecord(callback) {
        _record_end_time = Date.now();
        _recordSuccess = callback;
        try {
            const filePath = await AudioRecorder.stopRecording();
            if (Platform.OS === 'android') {
                _finishRecord({status: 'ok', audioFileURL: filePath});
            }
        } catch (error) {
            if (callback && typeof callback === "function") {
                callback({status: 'failed', message: '录音失败'});
            }
        }
    }

    function _startPlay(file_name, callback) {
        _stopPlay();
        let file_path = audioPath + '/' + file_name;
        _play_instance = new Sound(file_path, "", (error) => {
            if (error && callback && typeof callback === "function") {
                callback({status: 'failed', error});
            } else {
                if (callback && typeof callback === "function") {
                    callback({status: 'success'});
                }
                if (_play_instance.isLoaded) {
                    _play_instance.stop();
                }
                if (Platform.OS !== 'android') {
                    _play_instance.setSpeed(1);
                }
                _play_instance.play(() => {
                    if (callback && typeof callback === "function") {
                        callback({status: 'complete'});
                    }
                    _play_instance.release();
                    _play_instance = null;
                });
            }
        });
    }

    function _stopPlay() {
        if (_play_instance) {
            _play_instance.stop(() => {
                _play_instance.release();
                _play_instance = null;
            })
        }
    }

    return {
        startRecord: function (callback) {
            _startRecord(callback);
        },
        stopRecord: function (callback) {
            return _stopRecord(callback);
        },
        startPlay: function (file_name, callback) {
            _startPlay(file_name, callback);
        },
        stopPlay: function () {
            _stopPlay();
        },
    }
})();

export const File = (function () {
    function _exists(filePath) {
        return RNFS.exists(filePath);
    }

    function _download(url, type = "audio") {
        return new Promise((resolve) => {
            let downloadDir = downloadPath;
            if (type === "audio") {
                downloadDir = audioPath;
            }
            const fileName = getFileNameFromFileURL(url);
            const toFile = downloadDir + "/" + fileName;
            // https://yhk.oss-cn-qingdao.aliyuncs.com/zrk/chat/100101719/2017/9/25/cUFTFSRTe6QQbtj5SEe3yh.aac
            _exists(toFile).then(exist => {
                if (!exist) {
                    const ret = RNFS.downloadFile({fromUrl: url, toFile: toFile, background: true});
                    ret.promise.then(res => {
                        console.log("文件不存在，开始下载:" + toFile);
                        resolve({status: 'success', filePath: toFile, fileName});
                    }).catch(err => {
                        RNFS.unlink(toFile);
                        resolve({status: 'failed'});
                    });
                } else {
                    console.log("文件已存在:" + toFile);
                    resolve({status: 'success', filePath: toFile, fileName});
                }
            });
        })
    }

    function _upload(url, data, options={}) {
        console.log('begin upload file', data);
        const headers = options.headers || {};
        return new Promise((resolve)=>{
            fetch(url,{
                method:'POST',
                headers: {...headers},
                body:data,
            })
                .then((response) => response.json())
                .then((response)=>{
                    console.log('upload file success');
                    resolve({status: 'success', data: response});
                })
                .catch((error)=>{
                    console.log('upload file failed');
                    resolve({status: 'failed', error: error});
                });
        })
    }

    return {
        exists: function (filePath) {
            return _exists(filePath);
        },

        download: function (url) {
            return _download(url);
        },
        upload: function (url, data, options={}) {
            return _upload(url, data, options);
        },
    }
})();
