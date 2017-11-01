export function uploadFile(upload_url,formData) {
    return new Promise((resolve, reject)=>{
        fetch(upload_url,{
            method:'POST',
            headers:{
                access_token:'o6NPBHKuVb_DtMbGa6HxWA'
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