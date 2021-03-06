var express= require('express');
var path = require('path');
var parts=require('./partsController');
var files = require('./fileController');
var githubAuth = require('./githubAuth');
var downloader = require('./downloader');
var exists = require('./exists');
var prerender = require('prerender-node');
var products = require('./products');
var env = require('dotenv').config();
const morgan = require('morgan');
const debug = require('debug')('app');

//var lessMiddleware = require('less-middleware');
var app = express();
//var server = express();
var bodyParser = require('body-parser');
var rootPath = path.normalize(__dirname+"/../");
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended:true}));

app.use(morgan('tiny'));
/*
server.use('/ifs',app);
server.use(bodyParser.json({limit: '50mb'}));
server.use(bodyParser.urlencoded({limit: '50mb',extended:true}));
*/
//app.use(lessMiddleware(path.join(rootPath,"public"),{force:true}));
app.use(express.static(path.join(rootPath+"public")));
app.use("/pdf",express.static(path.join(rootPath,"public","pdfs")));
app.use(prerender.set('prerenderToken','f9W9oNVJetTfG6AyWhJo'));
app.use(function (req, res, next) {
  
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
  
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  // Pass to next layer of middleware
  next();
});
app.get("/data/:source",parts.get);
app.get("/files/:folder",files.get);
app.get("/github",githubAuth.get);
app.get("/github/auth",githubAuth.getAuth);
app.get("/products",products.get);
app.get("/products/:id",products.getProduct);
app.post("/auth",githubAuth.localAuth);
app.get("/auth",githubAuth.localAvailable);
app.get("/download",downloader.get);
app.get("/exists/:type/:filename",exists.get);
app.post("/files/",files.put);
app.post("/data/:source",parts.put);
app.get("/assets/js/bundle.js",function(req,res){
    res.sendFile(rootPath+"dist/bundle.js");
});
app.get("/assets/css/:fileName",function(req,res){
    let fn = req.params.fileName;
    res.contentType("text/css");
    res.sendFile(rootPath+"dist/css/"+fn);
});
app.get("/assets/css/images/:img",function(req,res){
    "use strict";
    let imn = req.params.img;
    res.sendFile(rootPath+"dist/images/"+imn);
});
app.get("*",function(req,res){
    res.sendFile(rootPath+"/index.html");
});
files.update();

/*
server.get("*",function(req,res){
  res.redirect("/ifs"+req.originalUrl);
  res.end();
});
server.post("*",function (req,res) {
  res.redirect(307, '/ifs' + req.originalUrl);
});
server.listen(process.env.PORT);
*/

app.listen(process.env.PORT || 8080);
console.log("Listening on port " + process.env.PORT + "...");
