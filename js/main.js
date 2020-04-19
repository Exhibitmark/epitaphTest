const repo = 'https://gitlab.com/api/v4/projects/18016791/repository/tree/'
const files = 'https://gitlab.com/api/v4/projects/18016791/repository/tree?path='
const file = 'https://gitlab.com/api/v4/projects/18016791/repository/files/'

const halo = {}

function get(cb, url, id){
    atomic(url)
    .then(function (response) {
        console.log(response.data)
        cb(response.data, id)
    })
    .catch(function (error) {
      //  console.log(error.status); 
      //  console.log(error.statusText); 
    });
}

function buildCategories(res){
    res.forEach(function(e){
        if(e.name === "Tools"){
            let url = files+e.name
            get(latestTools, url)
        }
        else if(e.name === "Halo") {
            get(getGames, e.url)
        }
    })
}

function latestTools(res){
    const tools = {}
    res.forEach(function(e){
        if(e.name !== 'index.md'){
            tools[e.name] = e.path
        }
    });
}

function getGames(res){
    res.tree.forEach(function(e){
        if(e.name !== 'index.md'){
            halo[e.path] = e.path
        }
    });
}

function switchContext(id){
    let url = files+"Halo/"+id
    get(buildList,url,id)
}

function buildList(res,id){
    if(res.length < 1){
        clearMain()
        let header = pageHeader('',id)
        $("#panel").append(header)
        let msg = '<div class="row"><div class="col-xl-8 col-md-6"><span>No content for this game</span></div></div>'
        $('#panel').append(msg)
    }
    else{
        clearMain()
        let header = pageHeader('',id)
        $("#panel").append(header)
        let fluid = containerFluid()
        $("#panel").append(fluid)
        let newRow = row()
        res.forEach(function(e,i){
            e.path = encodeURIComponent(e.path)+'?ref=master'
            if(e.name != 'index.md'){
                let item = listItem(e.path,e.name)
                newRow.appendChild(item);
            }
        })
        fluid.appendChild(newRow)
    }
}

function getFile(id){
    let url = file+id
    get(loadFile,url,id)
}

function loadFile(res,id){
    let str = decodeb64(atob(res.content))
    renderMD(str,id)
}

function decodeb64(b64){
    return decodeURIComponent(escape(atob(b64)));
}

function clearMain(){
    $("#panel").empty()
}

function renderMD(markdown,id){
    clearMain()
    //markdown = preprocess(markdown)
    let md = window.markdownit({
        html: true,
        breaks:true,
        typographer: true
    });
    process(markdown);
   // let test = markdown.substr(markdown.indexOf('#'),markdown.indexOf('##'))
   // let section = markdown.substr(markdown.indexOf('##'),markdown.indexOf('##'))
   // let result = md.render(markdown); 
    //$("#panel").append(fluid);
    cleanup()
}

function process(md){
    md = md.replace(/{: no_toc}/g,'')
    let arr = md.split(/(##)/g)
    arr.forEach(function(e,i){
        if(e == '##'){
            arr[i] = e+arr[i+1]
            arr[i+1] = ''
        }
    })
    let filtered = arr.filter(function (el) {
        return el != '';
    });
    let fluid = containerFluid('test')
    $("#panel").append(fluid);
    filtered.forEach(function(e,i){
        let mad = window.markdownit({
            html: true,
            breaks:true,
            typographer: true
        });
        $('#test').append('<div class="col-lg-12 section-card">'+mad.render(e)+'</div>');
    });
    $("#panel").append(fluid);
}

function cleanup(){
    $("#section-card").children('p').children('img').unwrap()
    $("#test").children().first().addClass('top-sec')
    $("img").addClass('width')
    $('code').wrap("<div class='container-fluid card'></div>")
    $("h1","h2","h3","h4","h5","h6").addClass('white')
}

function validation(e){
    if(getSize()){
        readFile(e)
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
function getSize(){
    let fi = document.getElementById('uploader');
    if(fi.files.item(0).size < 3145728){
        if(fileVerify(fi.files.item(0).name)){
            return true
        }
    }
    else {
        console.log('File is too big fam, it should be less than 3mb')
    }
    return false
}

//Sanitize HTML
function sanitizeString(str){
    return str.replace(/(<([^>]+)>)/ig,"");
}

//Read File and send it off to server
function readFile(evt){
    var f = evt.target.files[0]; 
    if (f) {
        var r = new FileReader();
        r.onload = function(e) { 
            let contents = e.target.result;
            let strippedHTML = sanitizeString(contents)
            let fi = document.getElementById('uploader');
            let author = $('#fname').val();
            let filename = fi.files.item(0).name
            let name = filename.substr(0,filename.length-3)
            let t = $('#category').val();
            let data = {
                author: author,
                filename: filename,
                contents: strippedHTML,
                name: t +"/"+ filename
            }
            data.name = encodeURIComponent(data.name.trim())
            data.name = data.name.replace('.','%2E')
            post('https://ambitious-smart-dance.glitch.me/', data)
        }
        r.readAsText(f);
    } else { 
        alert("Failed to load file");
    }
}

//#region Component Creation
function col12(){
    let div = document.createElement('div');
    div.setAttribute('class', 'col-lg-12');
    return div
}

function pageHeader(id,content){
    let div = document.createElement('div');
    div.setAttribute('class', 'd-sm-flex align-items-center justify-content-between mb-4 col-lg-12 pt-2');
    let c = h1('',content)
    div.appendChild(c);
    return div
}

function h1(id,content){
    let h1 = document.createElement('h1');
    h1.textContent = content;
    h1.setAttribute('class', 'page-header mb-0');
    return h1
}

function h5(content){
    let h5 = document.createElement('h5');
    h5.textContent = content;
    h5.setAttribute('class', 'mb-0 white');
    return h5
}

function listItem(id, content){
    let item = document.createElement('div');
    item.setAttribute('class', 'clickable guide co-6 mb-4 card');
    item.setAttribute('style','padding:2rem')
    item.setAttribute('id', id);
    let name = h5(content.substr(0,content.length-3))
    item.appendChild(name);
    return item
}

function row(){
    let row = document.createElement('div');
    row.setAttribute('class', 'row');
    return row
}

function containerFluid(id){
    if(id){

    }
    else{
        id = ''
    }
    let fluid = document.createElement('div');
    fluid.setAttribute('class', 'container-fluid');
    fluid.setAttribute('id', id);
    return fluid
}
//#endregion


function markdownParser(page){
    clearMain()
    page = page.replace(/{: no_toc}/g,'')
    mdHeader(page)
}

function mdHeader(head){
    let div = containerFluid()
    let c = head.substr(head.indexOf('#'),head.indexOf('##'))
    let title = c.substr(c.indexOf('#')+1,c.indexOf('\n'))
    let desc = c.substr(c.indexOf('\n')+1,c.length-1)
    desc = desc.replace(/\n/g,'')
    let h = pageHeader('', title)
    console.log(h)
    div.appendChild(h)
    $('#panel').append(div)
    //console.log(desc)
}