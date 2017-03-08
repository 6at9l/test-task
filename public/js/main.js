document.addEventListener("DOMContentLoaded", function(){
	
	
	getDirTree("/");
	/* open folder */
	document.getElementById("folders").addEventListener("click", function(e){
		selectFolder = e.target.parentNode;
		lastItemClick = e.target;
		setTimeout(function(){
			openFolder();
			//console.log(1)
		}, 500);
	});
	/* rename */
	document.getElementById("folders").addEventListener("dblclick", function(e){
		if(systemDir){return;}
		clickFlag.event_1 = true;
		clickFlag.event_2 = true;
		selectFolder = e.target.parentNode;
		lastItemClick = e.target;
		openInput(e);
	});

	document.addEventListener("click", function(){
		closeInput();
	});
	document.getElementById("newname").addEventListener("keydown", function(e){
		if(e.keyCode === 13){
			rename(document.getElementById("newname").value);
			closeInput();
		}
	});
	
	document.getElementById("newname").addEventListener("mousedown", function(e){
		noCloseInput = true;
	});
	/* rename */
	
	/* add folder */
	document.getElementById("addInDir").addEventListener("click", function(e){
		if(systemDir){return;}
		addNewDir();
	});
	/* delete */
	document.getElementById("deletDir").addEventListener("click", function(e){
		if(systemDir){return;}
		deletFoledr(selectFolder);
	});
	document.getElementById("popClose").addEventListener("click", function(e){
		document.getElementById("pop").style.display = "none";
	});
	
	document.getElementById("searchCurDir").addEventListener("input", function(e){
		var arrElems = document.getElementsByClassName("searchFiles");
		var len = arrElems.length;
		for(var i = 0; i < len; i++){
			if(arrElems[i].innerHTML.indexOf(e.target.value) + 1){
				arrElems[i].childNodes[0].style.display = "block";
			}else{
				arrElems[i].childNodes[0].style.display = "none";
			}
		}
	});
	
	document.getElementById("openForm").addEventListener("click", function(e){
		if(systemDir){return;}
		if(document.getElementById("fileLoad").style.display === "none"){
			document.getElementById("fileLoad").style.display = "block";
			document.getElementById("fileLoad").style.left = e.target.parentNode.getBoundingClientRect()["left"] + "px";
			document.getElementById("fileLoad").style.top =  e.target.parentNode.getBoundingClientRect()["bottom"] + "px";
		}else{
			document.getElementById("fileLoad").style.display = "none";
		}
	});
	
	document.getElementById("selectSystem").addEventListener("click", function(e){
		systemDir = true;
		selectFolder = document.getElementById("folders");
		selectFolder.innerHTML = "";
		getDirTree("system/");
	});
	
	document.getElementById("selectUSER").addEventListener("click", function(e){
		systemDir = false;
		selectFolder = document.getElementById("folders");
		selectFolder.innerHTML = "";
		getDirTree("/");
		
	});
	
	document.forms.upload.onsubmit = function() {
		event.preventDefault();
		var input = this.elements.downloaded_file;
		var file = input.files[0];
		if (file) {
			var path = selectFolder.getAttribute("data-src").replace("files\\users\\", "/");
			path = path.replace(/\\/g, "/");
			
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "upload", true);
			var formData = new FormData();
			formData.append("file", input.files[0]);
			formData.append("path", path);
			xhr.send(formData);
			xhr.onload = function(){
				if(xhr.status !== 200){return;}
				getImgList();
				document.getElementById("fileLoad").style.display = "none";
			}
			
		}
		return false;
	}
});