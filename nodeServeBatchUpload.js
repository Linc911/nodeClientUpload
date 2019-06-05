//引入http模块
var http = require('http');
//引入fs模块
var fs = require('fs');
var path = require('path');
//引入url模块
var url = require('url');

//开启本地http服务，监听相应端口号
http.createServer(function(req,res){
//获取requset信息中的host地址
    var hostname = req.headers.host;
//获取pathname
    var parseUrl = url.parse(req.url);
    var pathname = parseUrl.pathname;
    if(pathname == '/favicon.ico'){
        res.end("")
    }
    var query = parseUrl.search ? formatSearch(parseUrl.search) : "";
//判断是否为域名地址（简单路由）
    /*if(pathname === '/'){
        readFileAndResponse('/index.html',res);
    }*/
    if(pathname === '/filePath' && query && query.dirName){
        var filePathNames = [];
        var errorPathNames = [];
        // fileDisplay(query.dirName,res,filePathNames,errorPathNames);
        fileSyncDisplay(query.dirName,res,filePathNames,errorPathNames);
        res.end(JSON.stringify({
            filePathNames:filePathNames,
            errorPathNames:errorPathNames,
        }))
        // readDirNameAndResponse(query.dirName,res);
    }else if(pathname === '/upload' && query && query.uploadPath){
        /*uploadFile(query.uploadPath,function () {
            console.log(query.uploadPath + "上传成功")
        });*/
        nodeClientUpload.init("file",query.uploadPath,res)
    }else{
        readFileAndResponse('/404.html',res);
    }
}).listen(8888);
function formatSearch(se){
    if (typeof se !== "undefined") {
        se = se.substr(1);
        var arr = se.split("&"),
            obj = {},
            newarr = [];
        arr.forEach(function (v,i) {
            newarr = v.split("=");
            if (typeof obj[newarr[0]] === "undefined") {
                obj[newarr[0]] = newarr[1];
            }
        })
        return obj;
    }
}
//读取文件并返回response
function readFileAndResponse(pathname,response){
//判断文件是否存在
    fs.readFile(pathname.substr(1),'',function(err,data){
//文件不存在或读取错误返回404，并打印page not found
        if(err){
            response.writeHead(404);
            response.end('page not found');
        }
        else{
//读取成功返回相应页面信息
            response.end(data);
        }
    });
}
function readDirNameAndResponse(dirname,res) {
    if(!dirname){
        response.end("");
    }
    fs.stat(dirname,function(err,stat){
        if (err) {
            console.error(err);
            throw err;
        }
        var isFile = stat.isFile();//是文件
        var isDir = stat.isDirectory();//是文件夹
        console.info(dirname+"是一个"+isFile);
        console.info(dirname+"是一个"+isDir);
        if(isDir){
            fileDisplay
        }
    });
//    @todo;
}
/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
function fileDisplay(filePath,res,filePathNames,errorPathNames){

    console.log(filePath)
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,function(err,files){
        console.log(filePath)
        if(err){
            res.end("服务器异常！")
            console.warn(err)
        }else{
            //遍历读取到的文件列表
            files.forEach(function(filename){
                //获取当前文件的绝对路径
                var filedir = path.join(filePath,filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir,function(eror,stats){
                    if(eror){
                        console.warn('获取文件stats失败');
                        errorPathNames.push(filedir)
                    }else{
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if(isFile){
                            console.log(filedir);
                            filePathNames.push(filedir)
                        }
                        if(isDir){
                            fileDisplay(filedir,res,filePathNames,errorPathNames);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });

}
function fileSyncDisplay(filePath,res,filePathNames,errorPathNames){
    console.log(filePath)
    //根据文件路径读取文件，返回文件列表
    var files = fs.readdirSync(filePath);
    files.forEach(function(filename){
        //获取当前文件的绝对路径
        var filedir = path.join(filePath,filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        var stats = fs.statSync(filedir)
        var isFile = stats.isFile();//是文件
        var isDir = stats.isDirectory();//是文件夹
        if(isFile){
            console.log(filedir);
            filePathNames.push(filedir)
        }
        if(isDir){
            fileSyncDisplay(filedir,res,filePathNames,errorPathNames);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
        }
    });
}
/* Node.js模拟浏览器文件方法一*/
function uploadFile(filePath,callback) {
    let boundaryKey = '----' + new Date().getTime();    // 用于标识请求数据段
    let options = {
        host: 'localhost', // 远端服务器域名
        port: 30710, // 远端服务器端口号
        method: 'POST',
        path: `/DocumentManager/PublicFeatures/UploadFile?fileId=6ee17ad542d845f997a0d930f&TableName=cp_20190525114603e083`, // 上传服务路径
        headers: {
            'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
            'Connection': 'keep-alive',
            'Cookie': 'ASP.NET_SessionId=fbenetylqzulh0hi3b5txmmt; platform=Name=D6qR4cPvKsE=; sidebar_closed=1',
            'Origin': 'http://localhost:30710',
            'Referer': 'http://localhost:30710/DocumentManager/FileRegistra?pageType=collectionLib',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
        }
    };
    let req = http.request(options, function(res){
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            console.log('body: ' + chunk);
        });

        res.on('end', function() {
            callback(res);
            console.log('res end.');
        });
    });
    /*req.write(
     '--' + boundaryKey + 'rn' +
     'Content-Disposition: form-data; name="upload"; filename="test.txt"rn' +
     'Content-Type: text/plain'
     );*/
    req.write(
        `--${boundaryKey}rn Content-Disposition: form-data; name="file"; filename="${filePath}"rn Content-Type: text/plain`
    );
    /*filePaths.foreach(function (path) {

    })*/
    // 创建一个读取操作的数据流
    let fileStream = fs.createReadStream(filePath,{bufferSize:1024 * 1024});
    fileStream.pipe(req, {end: false});
    fileStream.on('end', function() {
        req.end('rn--' + boundaryKey + '--');
        callback && callback(null);
    });
}
/* Node.js模拟浏览器文件方法二*/
var nodeClientUpload = {
    init:function (fieldName,filePath,clientRes) {
        this.clientRes = clientRes;
        this.postRequest({//各类设置
            "url":"http://localhost:30710/DocumentManager/PublicFeatures/UploadFile?fileId=6ee17ad542d845f997a0d930f&TableName=cp_20190525114603e083",//url
            "file":filePath,//文件位置
            "param":fieldName,//文件上传字段名
            "field":{//其余post字段

            },
            "headers":{
                'Connection': 'keep-alive',
                'Cookie': 'ASP.NET_SessionId=fbenetylqzulh0hi3b5txmmt; platform=Name=D6qR4cPvKsE=; sidebar_closed=1',
                'Origin': 'http://localhost:30710',
                'Referer': 'http://localhost:30710/DocumentManager/FileRegistra?pageType=collectionLib',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36',
            },
            "boundary":"----WebKitFormBoundary"+ this.getBoundary()
        });
    },
    getfield:function(field, value) {//post值payload
        return 'Content-Disposition: form-data; name="'+field+'"\r\n\r\n'+value+'\r\n';
    },
    getfieldHead:function (field, filename) {//文件payload
        var fileFieldHead='Content-Disposition: form-data; name="'+field+'"; filename="'+filename+'"\r\n'+'Content-Type: '+this.getMime(filename)+'\r\n\r\n';
        return fileFieldHead;
    },
    getMime:function (filename) {//获取Mime
        var mimes = {
            '.txt': 'text/plain ',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.js': 'appliction/json',
            '.torrent': 'application/octet-stream'
        };
        var ext = path.extname(filename);
        var mime = mimes[ext];
        mime=!!mime?mime:'application/octet-stream';
        return mime;
    },
    getBoundary:function() {//获取边界检查随机串
        var max = 9007199254740992;
        var dec = Math.random() * max;
        var hex = dec.toString(36);
        var boundary = hex;
        return boundary;
    },
    getBoundaryBorder:function (boundary) {//获取boundary
        return '--'+boundary+'\r\n';
    },
    fieldPayload:function (opts) {//字段格式化
        var payload=[];
        for(var id in opts.field){
            payload.push(this.getfield(id,opts.field[id]));
        }
        payload.push("");
        return payload.join(this.getBoundaryBorder(opts.boundary));
    },
    postRequest:function  (opts) {//post数据
        var self = this;
        this.filereadstream(opts,function (buffer) {
            var options=require('url').parse(opts.url);
            var Header= opts.headers;
            var h= self.getBoundaryBorder(opts.boundary);
            var e= self.fieldPayload(opts);
            var a= self.getfieldHead(opts.param,opts.file);
            var d="\r\n"+h;
            Header["Content-Length"]=Buffer.byteLength(h+e+a+d)+buffer.length;
            Header["Content-Type"]='multipart/form-data; boundary='+opts.boundary;
            options.headers=Header;
            options.method='POST';
            var req=http.request(options,function(res){
                var data='';
                res.on('data', function (chunk) {
                    data+=chunk;
                });
                res.on('end', function () {
                    // self.clientRes.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    self.clientRes.setHeader('Content-Type', 'application/json;charset=utf-8');
                    self.clientRes.end(data)
                    // self.clientRes.end(data.toString('utf8'))
                    console.log(res.statusCode)
                    console.log(data);
                });
            });
            req.write(h+e+a);
            // log.diy(h+e+a+buffer+d);
            req.write(buffer);
            req.end(d);
        });

    },
    filereadstream:function (opts, fn) {//读取文件

        var readstream = fs.createReadStream(opts.file,{flags:'r',encoding:null});
        var chunks=[];
        var length = 0;
        readstream.on('data', function(chunk) {
            length += chunk.length;
            chunks.push(chunk);
        });
        readstream.on('end', function() {
            // var buffer = new Buffer(length);
            var buffer = new Buffer.alloc(length, 'base64');
            for(var i = 0, pos = 0, size = chunks.length; i < size; i++) {
                chunks[i].copy(buffer, pos);
                pos += chunks[i].length;
            }
            fn(buffer);
        });
    },

}


