function post(url, payload) {
    atomic(url, {
        method: 'POST',
        data: payload,
        headers: { 
            'Content-type': 'application/json'
        },
        responseType: 'text',
        withCredentials: false 
    })
    .then(function (response) {
		if(response.data.type == 'success'){
            $("#uploadText").val('Successfully uploaded file')
            $("#upload").addClass('good-upload')
        }
	})
}

function validation(info, e){
    if(getSize(info)){
        let file = $("#uploadFile").prop("files")[0]
        readFile(file,info)
    }
}

//Checks whether the file has valid extensions
function fileVerify(file){
    let ext = getExtension(file)
    if(fileIsValid(ext)){
        return true
    }
    return false;
}

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}
function fileIsValid(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
        case 'md':
        case 'txt':
        case 'markdown':
        return true;
    }
    console.log("File isn't markdown fam")
    return false;
}

//Check file size
function getSize(info){
    if(info.size < 50000){
        if(fileVerify(info.filename)){
            return true
        }
    }
    else {
        console.log('File is too big fam, it should be less than 5mb')
    }
    return false
}

//Sanitize HTML
function sanitizeString(str){
    return str.replace(/(<([^>]+)>)/ig,"");
}

//Read File and send it off to server
function readFile(f,info){
    if(f) {
        let r = new FileReader();
        r.onload = function(e) { 
            let contents = e.target.result;
            info.contents = sanitizeString(contents)
            info.name = info.category+"/"+info.subcategory+"/"+info.filename
            info.name = encodeURIComponent(info.name.trim())
            info.name = info.name.replace('.','%2E')
            console.log(info)
            post('https://ambitious-smart-dance.glitch.me/', info)
        }
        r.readAsText(f);
    } else { 
        alert("Failed to load file");
    }
}