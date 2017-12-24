import storage from './storage'

/**
 * 新建或更新HTML
 * @param html
 */
export function saveHtml(html, callback){

    storage.save({
        key:'HTML',
        data: html,
        expires: null
    }).then((result) => {
        callback({result:1})
    }).catch((error) => {
        callback({result:0})
    })

}

/**
 * 查询HTML
 */
export function queryHTML(callback){
    storage.load({
        key:'HTML',
        autoSync: true,
        syncInBackground: true,
    }).then(result => {
        callback({result:1, html:result})
    }).catch(err => {
        callback({result:0, html:{}})
    })
}

/**
 * 移除HTML
 */
export function removeHtml(callback){
    storage.remove({
        key: 'HTML'
    }).then(result => {
        callback({result:1})
    }).catch(err => {
        callback({result:0})
    });
}
