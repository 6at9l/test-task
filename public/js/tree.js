function getDirTree(path){
	let getDir = new XMLHttpRequest();
	getDir.open("POST", "/dir");
	getDir.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	getDir.send("key=123&path=" + encodeURIComponent(path) + "&user=123");
	getDir.onload = function(){
		if (getDir.status !== 200){return 0;}
		try{
			//console.log(JSON.parse(getDir.responseText).children);
			createTree(JSON.parse(getDir.responseText).children);
			firstRun = false;
			getImgList();
		}catch(error){}
	}
}

function createTree(a){
	var count = a.length;
	var html = "";
	for(var i = 0; i < count; i++){
		try{
			var len = a[i].children.length;
			var flag = false;
			for(var j = 0; j < len; j++){
				try{
					a[i].children[j].children.length;
					flag = true;
					break;
				}catch(error){
					flag = false;
				};
			}
			html += "<div class='folder' data-src='" + a[i].path + "'>";
			html += "<i class='fa " + (flag ? "fa-folder" : "fa-folder-o") + "'>&nbsp;</i>";
			html += "<span class='" + ((i === 0) && firstRun ? "selectDir" : "");
			html += "'>" + a[i].name + "</span>";
			html += "</div>";
		}catch(error){}
	}
	window.selectFolder.innerHTML += html;
	selectFolder = document.getElementsByClassName("selectDir")[0].parentNode;
	//console.log(selectFolder);
}
/* open close folder */
function openFolder(){
	// if "d click cansel this function"
	if (clickFlag.event_1){
		clickFlag.event_1 = !clickFlag.event_1;
		return;
	}
	if (clickFlag.event_2){
		clickFlag.event_2 = !clickFlag.event_2;
		return;
	}
	if (selectFolder.className.indexOf("folder") < 0){
		return;
	}
	
	var elem = selectFolder;
	if(systemDir){
		var path = selectFolder.getAttribute("data-src").replace("files\\system\\", "/");
		path = "./files/system" + path;
		//console.log(path);
	}else{
		var path = selectFolder.getAttribute("data-src").replace("files\\users\\", "/");
	}
	
	if(elem.parentNode.className.indexOf("folder") + 1){
		if(lastItemClick.tagName === "I"){ // if open or close folder
			if (lastItemClick.className.indexOf("fa-folder-open") + 1){ // close
				lastItemClick.className = lastItemClick.className.replace("fa-folder-open", "fa-folder");
				deleteFolderInTree(elem);
				
			}else if(lastItemClick.className.indexOf("fa-folder-o") + 1){ // if folder no has folder
				return;
			}else{ // open
				getDirTree(path);
				lastItemClick.className = lastItemClick.className.replace("fa-folder", "fa-folder-open");
			}
		}else if(lastItemClick.tagName === "SPAN"){
			setSelectdir();
			
			/* Подгрузить контент в imgList */
			getImgList();
		}
	}
}
/* set "shadow" current folder */
function setSelectdir(){
	var arrSelsect = document.getElementsByClassName("selectDir");
	var len = arrSelsect.length;
	for (var i = 0; i < len; i++){
		arrSelsect[i].className = "";
	}
	lastItemClick.className = "selectDir";
}
/* if folder close need delete all dir in this folder */
function deleteFolderInTree(elem){
	var len = elem.childNodes.length;
	var arrDel = [];
	for (var i = 0; i < len; i++){ // delete elem form close dir
		if (elem.childNodes[i].tagName === "DIV"){
			arrDel[arrDel.length] = elem.childNodes[i];
		}else if (elem.childNodes[i].tagName === "SPAN"){
			lastItemClick = elem.childNodes[i];
			setSelectdir();
			/* Подгрузить контент в imgList */
			getImgList();
		}
	}

	var len = arrDel.length;
	for(var i = 0; i < len; i++){
		elem.removeChild(arrDel[i]);
	}
}
/* */
function rename(n){
	if(document.getElementsByClassName("selectDir")[0].innerHTML === "mainDir"){return;}
	/*lastItemClick.innerHTML = n;*/
	if(systemDir){
		var path = selectFolder.getAttribute("data-src").replace("files\\system\\", "/");
	}else{
		var path = selectFolder.getAttribute("data-src").replace("files\\users\\", "/");
	}
	
	path = path.replace(/\\/g, "/");
	var newname = path.split("/");
	newname[newname.length - 1] = n;
	newname = newname.join("/");
	let renameDir = new XMLHttpRequest();
	renameDir.open("POST", "/rename");
	renameDir.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	renameDir.send("newname=" + encodeURIComponent(newname) + "&path=" + encodeURIComponent(path) + "&user=123&key=sds");
	renameDir.onload = function(){
		if (renameDir.status !== 200){return 0;}
		try{
			if(renameDir.responseText === "good"){
				/* reset */
				lastItemClick.innerHTML = n;
				selectFolder.setAttribute("data-src", newname);
			}
		}catch(error){}
	}
}
function openInput(e){
	if(lastItemClick.tagName === "SPAN"){
		document.getElementById("rename").style.display = "block";
		document.getElementById("rename").style.left = lastItemClick.getBoundingClientRect().left + "px";
		document.getElementById("rename").style.top = lastItemClick.getBoundingClientRect().top + "px";
		document.getElementById("newname").focus();
		
		setSelectdir();
		/* Подгрузить контент в imgList */
		getImgList();
	}
}
function closeInput(){
	if (noCloseInput){
		noCloseInput = false;
		return;
	}
	document.getElementById("rename").style.display = "none";
	document.getElementById("newname").value = "";
}
function addNewDir(){
	if(systemDir){
		var path = selectFolder.getAttribute("data-src").replace("files\\system\\", "/");
	}else{
		var path = selectFolder.getAttribute("data-src").replace("files\\users\\", "/");
	}
	path = path.replace(/\\/g, "/");
	var name = prompt("Enter folder name", "new");
	path += "/" + name;
	let createDir = new XMLHttpRequest();
	createDir.open("POST", "/create");
	createDir.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	createDir.send("key=123&path=" + encodeURIComponent(path) + "&user=123");
	createDir.onload = function(){
		if (createDir.status !== 200){return 0;}
		try{
			if(createDir.responseText === "good"){
				deleteFolderInTree(selectFolder);
				if(systemDir){
					var path = selectFolder.getAttribute("data-src").replace("files\\system\\", "/");
				}else{
					var path = selectFolder.getAttribute("data-src").replace("files\\users\\", "/");
				}
				getDirTree(path);
				for(var i = 0; i < selectFolder.childNodes.length; i++){
					if(selectFolder.childNodes[i].tagName === "I"){
						if(selectFolder.childNodes[i].className.indexOf("fa-folder-open") + 1){
		
							//console.log(0);
						}else if(selectFolder.childNodes[i].className.indexOf("fa-folder-o") + 1){
							//console.log(1);
							selectFolder.childNodes[i].className = selectFolder.childNodes[i]
																		   .className
																		   .replace("fa-folder-o", "fa-folder-open");
						}else{
							//console.log(2);
							selectFolder.childNodes[i].className = selectFolder.childNodes[i]
																		   .className
																		   .replace("fa-folder", "fa-folder-open");
						}
					}
				}
			}
		}catch(error){}
	}
}
function deletFoledr(elem){
	if(document.getElementsByClassName("selectDir")[0].innerHTML === "mainDir"){return;}
	if(systemDir){
		var path = selectFolder.getAttribute("data-src").replace("files\\system\\", "/");
	}else{
		var path = selectFolder.getAttribute("data-src").replace("files\\users\\", "/");
	}
	path = path.replace(/\\/g, "/");
	var yes = confirm("delete path : " + path);
	if(!yes){return;}
	let delDir = new XMLHttpRequest();
	delDir.open("POST", "/delete");
	delDir.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	delDir.send("key=123&path=" + encodeURIComponent(path) + "&user=123");
	delDir.onload = function(){
		if (delDir.status !== 200){return 0;}
		if(delDir.responseText === "good"){
			selectFolder = selectFolder.parentNode;
			deleteFolderInTree(selectFolder);
			if(systemDir){
				var path = selectFolder.getAttribute("data-src").replace("files\\system\\", "/");
			}else{
				var path = selectFolder.getAttribute("data-src").replace("files\\users\\", "/");
			}
			getDirTree(path);
		}
	}
}
/*
	<div class="folder">
		<span class="fa fa-folder-open">&nbsp;name dir</span>
		<div class="folder">
			<span class="fa fa-folder">&nbsp;name dir</span>
		</div>
		<div class="folder">
			<span class="fa fa-folder-open">&nbsp;name dir</span>
			<div class="folder">
				<span class="fa fa-folder">&nbsp;name dir</span>
			</div>
			<div class="folder">
				<span class="fa fa-folder-o selectDir">&nbsp;name dir</span>
			</div>
		</div>
		<div class="folder">
			<span class="fa fa-folder">&nbsp;name dir</span>
		</div>
	</div>
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* images */
function getImgList(){
	if(systemDir){
		var path = selectFolder.getAttribute("data-src").replace("files\\system\\", "/");
		path = "./files/system" + path;
	}else{
		var path = selectFolder.getAttribute("data-src").replace("files\\users\\", "/");
		//console.log(path);
	}
	path = path.replace(/\\/g, "/");
	let imgs = new XMLHttpRequest();
	imgs.open("POST", "/images");
	imgs.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	imgs.send("key=123&path=" + encodeURIComponent(path) + "&user=123");
	imgs.onload = function(){
		if (imgs.status !== 200){return 0;}
		viewImg(JSON.parse(imgs.responseText));
	}
}

function viewImg(arr){
	document.getElementById("imgList").innerHTML = "";
	if(table){
		var html = "<table>";
		var count = arr.length + arr.length % inline;
		for(var i = 0; i < (count / inline); i++){
			html += "<tr>"
			for(var t = 0; t < inline; t++){
				try{
					buffer = arr[t + i * inline].split("/");
					buffer.splice(0, 2);
					var id = "id"  + Math.random() + t + i * inline;
					var code = "document.getElementById(\"" + id + "\").innerHTML =  this.naturalWidth + \"X\" + this.naturalHeight;";
					html += "<td class='searchFiles'>";
					html += "<div class='object'>";
					html += "<div><div class='fa fa-close fr' title='delet' onclick='deletIMG(\"" +  arr[t + i * inline] + "\")'></div></div>";
					html += "<img onclick='openPopWin();' src='" + buffer.join("/") + "' onload='" + code + "'>";
					html += "<p class='name'>" + buffer[buffer.length - 1] + "</p>";
					var im = new Image();
					im.src = buffer.join("/");
					
					html += "<p class='size' id='" + id + "'></p>";
					html += "</div>";
					html += "</td>\n";
				}catch(err){
					html += "<td></td>";
				}
				
			}
			html += "</tr>";
		}
		html += "</table>";
		document.getElementById("imgList").innerHTML = html;
	}else{
		
	}
}
function openPopWin(){
	document.getElementById("pop").style.display = "block";
	document.getElementById("popIm").src = event.target.src;
	document.getElementById("pop").style.left = window.innerWidth / 2 -  document.getElementById("pop").getBoundingClientRect()["width"] / 2 + "px";
	document.getElementById("pop").style.top = window.innerHeight / 2 - document.getElementById("pop").getBoundingClientRect()["height"] / 2 + "px";
	
}
function deletIMG(path){
	var el = event.target.parentNode.parentNode;
	let delIm = new XMLHttpRequest();
	delIm.open("POST", "/delim");
	delIm.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	delIm.send("key=123&path=" + encodeURIComponent(path) + "&user=123");
	delIm.onload = function(){
		if (delIm.status !== 200){return 0;}
		if (delIm.responseText === "good"){
			el.parentNode.removeChild(el);
		}
	}
}

function sendFile(){
	
}
/*
	<table>
		<tr>
			<td>
				<div class="object">
					<div><div class="fa fa-close fr" title="delet"></div></div>
					<div>
						<img src="users/Снимок.PNG">
						<p class="name">name file</p>
						<p class="size">30x30px</p>
					</div>
				</div>
			</td>
		</tr>
	</table>
*/