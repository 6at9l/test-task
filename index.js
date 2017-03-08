var express = require("express");
var galleryApp = express();
var bodyParser = require("body-parser");
var multiparty = require('multiparty');
var mkdirp = require('mkdirp');
var getDirContent = require('directory-tree');
var uid = require("rand-token").uid;
var fs = require("fs");
var rmdir = require("rmdir");
var fse = require('fs-extra');
let sql = require("sqlite3").verbose();

let usersDir = "./files/users";
let systemDir = __dirname + "./files/system";

//let db = new sql.Database("db/gallery");
galleryApp.use(bodyParser.urlencoded({extended: false}));

galleryApp.use(express.static("public"));
galleryApp.use(express.static("files"));
galleryApp.set("view engine", "jade");

galleryApp.get("/", function(req, res){
	res.sendfile("index.html");
});

/* routs */

galleryApp.post("/dir", function(req, res){
	var path = decodeURIComponent(req.body.path);
	if (path === "system/"){
		path =  "./files/" + path;
	}else if(path.indexOf("./files/")=== 0){
		
	}else{
		var targetUserDir = "/user1";
		if(path.indexOf(targetUserDir) + 1){targetUserDir = "";}
		path = usersDir + targetUserDir + path;
	}
	//console.log(path);
	var content = JSON.stringify(getDirContent(path, [".jpg", ".PNG", ".png"]));
	res.send(content);	
});

galleryApp.post("/rename", function(req, res){
	var path = decodeURIComponent(req.body.path);
	var newname = decodeURIComponent(req.body.newname);
	var targetUserDir = "/user1";
	if(path.indexOf(targetUserDir) + 1){targetUserDir = "";}
	path = usersDir + targetUserDir + path;
	newname = usersDir + targetUserDir + newname;
	//console.log(path);
	//console.log(newname);
	try{
		fs.rename(path, newname, function (err){
			if(err){
				res.send("error");
			}else{
				res.send("good");
			}
		});
	}catch(error){
		res.send("error");
	}
	//res.send(content);	
});

galleryApp.post("/create", function(req, res){
	var path = decodeURIComponent(req.body.path);
	var targetUserDir = "";
	path = usersDir + targetUserDir + path;
	var count = 0;
	var flag = true;
	var bufferPath = path;
	while(flag){
		if (fs.existsSync(bufferPath)){
			bufferPath = path + "_new_" + count; 
			count++;
		}else{
			path = bufferPath;
			flag = false;
			break;
		}
	}

	mkdirp(path, function(err){ 
		//console.log(err);
		//console.log(path);
		if(err){
			res.send("bad");
		}else{
			res.send("good");
		}
	});

	//	
});
galleryApp.post("/delete", function(req, res){
	var path = decodeURIComponent(req.body.path);
	var targetUserDir = "";
	path = usersDir + targetUserDir + path;
	
	rmdir(path, function (err, dirs, files){
		if(err){res.send("bad");}
		else{res.send("good");}
	});
});

galleryApp.post("/images", function(req, res){
	var path = decodeURIComponent(req.body.path);
	var targetUserDir = "";
	if(path.indexOf("./files/")=== 0){
		//console.log(path);
	}else{
		path = usersDir + targetUserDir + path;
		//console.log(path);
	}
	
	var arrTarget = [];
	
	fs.readdir(path, function(err, files){
		for(key in files){
			if((files[key].indexOf(".jpg") + 1) || (files[key].indexOf(".JPG") + 1)||
			   (files[key].indexOf(".PNG") + 1) || (files[key].indexOf(".png") + 1)){
					arrTarget[arrTarget.length] = path + "/" + files[key];
			   }
		}
		res.send(JSON.stringify(arrTarget));
	});
	/*
	var allImg = getDirContent(path, [".jpg", ".PNG", ".png"]);
	var len = allImg.length;
	for(var i = 0; i < len; i++){
		console.log(allImg[i].path);
		try{
			allImg[i].extension;
			console.log(path);
			console.log(allImg[i].path);
			if (allImg[i].path.replace(/\\\\/g, "/") === path){
				arrTarget[arrTarget.length] = allImg[i];
			}
		}
		catch(err){console.log(err);}
	}
	*/
	//console.log(arrTarget);
	//res.send(JSON.stringify(dirContent))
});

galleryApp.post("/delim", function(req, res){
	var path = decodeURIComponent(req.body.path);
	fs.unlink(path);
	res.send("good");
});

galleryApp.post("/upload", function(req, res){
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {
		try{
			for(var i = 0; i < files.file.length; i++){
				//console.log(files.file[i]);
				var pathT = __dirname + "\\" + ((usersDir + fields.path[0]).replace(/\//g, "\\")).replace(".\\", "") + "\\";
				var pathL = files.file[i].path;
				var buffer = pathL.split("\\");
				pathT += buffer[buffer.length - 1];
				fs.createReadStream(pathL).pipe(fs.createWriteStream(pathT));
			}		
		}catch(err){}
		res.send("good");		
    });
	
});

galleryApp.listen(3000, function(){
	console.log("app statr on port 3000");
});

