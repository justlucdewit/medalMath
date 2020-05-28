if (new URLSearchParams(window.location.search).get('error')) { 
	const el = document.getElementsByClassName("errorBox")[0];
	el.style.display = "inline-block";
	el.innerHTML = new URLSearchParams(window.location.search).get('error');
}

else if (new URLSearchParams(window.location.search).get('success')){
	const el = document.getElementsByClassName("errorBox")[0];
	el.style.display = "inline-block";
	el.innerHTML = new URLSearchParams(window.location.search).get('success');
	el.style.borderColor= "green";
	el.style.color = "green";
	el.style.backgroundColor = "#a5d899";
}