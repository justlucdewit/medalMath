if (new URLSearchParams(window.location.search).get('error')) { 
	document.getElementsByClassName("errorBox")[0].style.display = "inline-block";
}