"use strict";
exports.__esModule = true;
exports.generateQuestion = function (config) {
    var q = "";
    for (var i = 0; i < config.numberOfTerms * 2 - 1; i++) {
        if (i % 2 == 0) {
            q += Math.floor(Math.random() * Math.pow(10, config.maxDigits));
        }
        else {
            q +=
                config.operatorsAllowed[Math.floor(Math.random() * config.operatorsAllowed.length)];
        }
    }
    var answer = eval(q);
    while (!config.negativesAllowed && answer < 0) {
        q = exports.generateQuestion(config);
        answer = eval(q);
    }
    return q;
};
exports.getAnswers = function (questions) {
    var answers = [];
    for (var q in questions) {
        answers.push(eval(questions[q]));
    }
    return answers;
};
exports.generateQuestionArray = function (config, amount) {
    config.operatorsAllowed = config.operatorsAllowed.map(function (element) {
        return element === " " ? "+" : element;
    });
    var questions = [];
    for (var q = 0; q < amount; q++) {
        questions.push(exports.generateQuestion(config));
    }
    return questions;
};
var config = {
    maxDigits: 3,
    numberOfTerms: 2,
    operatorsAllowed: ["+", "-", "*", "/"],
    negativesAllowed: false
};
