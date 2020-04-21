"use strict";
const generateQuestion = (config) => {
    let q = { question: "", answer: 0 };
    for (let i = 0; i < config.numberOfTerms * 2 - 1; i++) {
        if (i % 2 == 0) {
            q.question += Math.floor(Math.random() * 10 ** (config.maxDigits - 1));
        }
        else {
            q.question += config.operatorsAllowed[Math.floor(Math.random() * config.operatorsAllowed.length)];
        }
    }
    q.answer = eval(q.question);
    while (!config.negativesAllowed && q.answer < 0) {
        q = generateQuestion(config);
    }
    return q;
};
const generateQuestionArray = (config, amount) => {
    let questions = [];
    for (let q = 0; q < amount; q++) {
        questions.push(generateQuestion(config));
    }
    return questions;
};
const config = {
    maxDigits: 3,
    numberOfTerms: 2,
    operatorsAllowed: ["+", "-", "*", "/"],
    negativesAllowed: false
};
const questions = generateQuestionArray(config, 30);
for (const question of questions) {
    console.log(`${question.question} = ${question.answer}`);
}
