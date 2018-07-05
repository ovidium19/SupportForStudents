module.exports = function(application){
    "use strict";
    application.factory("fileService",["$resource","$cacheFactory","$window",function($resource,$cacheFactory,$window){
        "use strict";
        //when we get data, we receive an array, therefore we have to specify isArray in the resource method definition
        var resource = $resource("./files/:folder",{folder:"@folder"},{
            'query': {method: 'GET',isArray: true},
        });
        var file_resource = $resource("./exists/:type/:filename",{type: "@type",filename: "@filename"});
        var files = {};
        var urls = {};
        function constructBody(data){
            return new Promise(function(resolve,reject){
                if (!data || data.length<1) reject({});
                let requestBody = {};
                let nrOfFiles = data.length;
                let iter = 0;
                for (let f of data){
                    let r = new FileReader();
                    r.onload = function(e){
                        iter++;
                        requestBody[f.name]={};
                        requestBody[f.name].type = f.type;
                        requestBody[f.name].content = e.target.result;
                        if (iter==nrOfFiles) resolve(requestBody);
                    };
                    r.readAsBinaryString(f);
                }
            });
        }
        return{
            get: function(group){
                return resource.query({folder:group});
            },
            post: function(){
                let data = [];
                for (let key of Object.keys(files)){
                    let dir = '';
                    if (files[key].file.type.startsWith('image'))
                            dir = 'images/';
                    else dir = 'pdfs/';
                    for (let ctx of files[key].context){
                        switch (ctx.type){
                            case 'image-single':
                            case 'image-list':
                                ctx.src = dir+key;
                                break;
                            case 'video-single':
                                ctx.video.thumb = dir+key;
                                break;
                            case 'link-pdf':
                                ctx.link = dir+key;
                                break;
                          case 'media-description':
                                ctx.src = dir+key;
                                break;
                            default:
                                ctx.link = dir+key;
                        }
                    }
                    data.push(files[key].file);
                }
                
               return constructBody(data).then(function(res){
                    console.log(this);
                    console.log(res);
                    for (let f of Object.keys(files)){
                        $window.URL.revokeObjectURL(files[f].url);
                    }
                    return resource.save(res);
                })
                   .catch(function(res){
                       return;
                   });
            },
            exists: function(type,fname){
                return file_resource.get({type: type,filename: fname});
            },
            addFile: function(args){
                let file = args[1];
                let ctx = args[0];
                if (!files.hasOwnProperty(file.name)){
                    files[file.name] = {
                        file,
                        context: [ctx]
                    }
                }
                else{
                    console.log("context: ");
                    if (!files[file.name].context){
                        files[file.name] = {
                            file,
                            context: ctx
                        }
                    }
                    else{
                        files[file.name].context.push(ctx);
                    }
                }
            },
            createUrls: function(args){
                function getKey(e){
                    if (e.hasOwnProperty('link'))
                        return 'link';
                    else if (e.hasOwnProperty('src'))
                        return 'src';
                    else return 'thumb';
                }
                if (args){
                    console.log("Gonna add the file straight away");
                    let fileParam = args[1];
                    let ctx = args[0];
                    if (!files[fileParam.name].url){
                        files[fileParam.name].url = $window.URL.createObjectURL(fileParam);
                    }
                    if (ctx.type==='image-single'){
                        ctx.src = files[fileParam.name].url;
                    }
                    else if (ctx.type==='video-single'){
                        ctx.video.thumb = files[fileParam.name].url;
                    }
                    urls[files[fileParam.name].url] = fileParam.name;
                    return;
                }
                for (let f of Object.keys(files)){
                    if (!files[f].hasOwnProperty('url')){
                        files[f].url = $window.URL.createObjectURL(files[f].file);
                        urls[files[f].url] = files[f].file.name;
                        
                    }
                    files[f].context.forEach(function(elem){
                        elem[getKey(elem)] = files[f].url;
                    });
                }
                console.log(files);
            },
            destroyUrls: function(){
                for (let f of Object.keys(files)){
                    $window.URL.revokeObjectURL(files[f].url);
                }
                
            },
            remove: function(ctx,name){
                if (name){
                    let i = files[name].context.findIndex(function(elem){
                        return elem.$$hashKey === ctx.$$hashKey;
                    });
                    if (i>-1)
                        files[name].context.splice(i,1);
    
                    if (files[name].context.length == 0){
                        if (files[name].hasOwnProperty('url')){
                            $window.URL.revokeObjectURL(files[name].url);
                        }
                        delete files[name];
                    }
                }
                else{
                    console.log("No file name was provided, looking for context in all files");
                    for (let k of Object.keys(files)){
                        let f = files[k];
                        let i = f.context.findIndex(function(elem){
                            return elem.$$hashKey === ctx.$$hashKey;
                        });
                        if (i>-1){
                            f.context.splice(i,1);
                        }
                        if (f.context.length == 0){
                            if (f.hasOwnProperty('url')){
                                $window.URL.revokeObjectURL(f.url);
                            }
                            delete files[k];
                        }
                    }
                }
               
                
               
            },
            getFileName: function(url){
                return urls[url];
            },
            log: function(){
                console.log("Files in memory: ");
                console.log(files);
                return;
            }
        }
    }]);
};