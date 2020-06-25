const getCookie = name => document.cookie.split(";").filter(item => item.split("=")[0] == name)[0].split("=")[1];
const uuid = getCookie("uuid");
let q;
let qindex = 0;

const mountFromUUID = async () => {
	const questions = await fetch(`https://medal-math.herokuapp.com/api/${uuid}`);
	q = (await questions.json()).questions;
	nextQuestion()
};

const putSpacesAround = (string, char) => string.split(char).join(` ${char} `);

const rerender = (question) => {
	document.getElementById("sum").innerHTML = putSpacesAround(putSpacesAround(question, "+"), "-");
	document.getElementById("progress").innerHTML = `vraag ${qindex} / ${q.length}`;
	document.getElementById("answer").value = "";
};

const nextQuestion = () => {
	rerender(q[qindex++]);
};

mountFromUUID();