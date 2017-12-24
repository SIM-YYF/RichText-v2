export function uploadFile(upload_url,formData) {
    return new Promise((resolve, reject)=>{
        fetch(upload_url,{
            method:'POST',
            headers:{
                access_token:'Wsh6OptXa9cZMTlUXjyWWQ'
            },
            body:formData,
        })
            .then((response) => response.json())
            .then((responseData)=>{
                resolve(responseData);
            })
            .catch((error)=>{
                reject(error);
            });
    })

}