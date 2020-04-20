type Operator = "+" | "-" | "*" | "/";

type ArrayOneOrMore<T> = { 0: T } & Array<T>

interface questionConfig {
	maxDigits:number,
	numberOfTerms:number,
	operatorsAllowed:ArrayOneOrMore<Operator>,
	negativesAllowed:boolean
}

interface question{
	question: string,
	answer: number
}

const generateQuestions = (config:questionConfig, amount:number) => {
	let questions:question[] = [];

	for (let q = 0; q < amount; q++){
		let ret:question = {
			question: "",
			answer: 0,
		};

		for (let i = 0; i < config.numberOfTerms*2-1; i++) {
			if (i%2==0) {
				ret.question += Math.floor(Math.random()*10**(config.maxDigits-1));
			}else{
				ret.question += config.operatorsAllowed[Math.floor(Math.random()*config.operatorsAllowed.length)]
			}
		}
		ret.answer = eval(ret.question);
		questions.push(ret);
	}
	return questions;
};

const config:questionConfig = {
	maxDigits: 3,
	numberOfTerms: 2,
	operatorsAllowed: ["+", "-"],
	negativesAllowed: false
};

const questions = generateQuestions(config, 30);
for (const question of questions){
	console.log(`${question.question} = ${question.answer}`);
}