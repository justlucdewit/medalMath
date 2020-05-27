interface questionConfig {
  maxDigits: number;
  numberOfTerms: number;
  operatorsAllowed: string[];
  negativesAllowed: boolean;
}

export const generateQuestion = (config: questionConfig) => {
  let q = "";
  for (let i = 0; i < config.numberOfTerms * 2 - 1; i++) {
    if (i % 2 == 0) {
      q += Math.floor(Math.random() * 10 ** config.maxDigits);
    } else {
      q +=
        config.operatorsAllowed[
          Math.floor(Math.random() * config.operatorsAllowed.length)
        ];
    }
  }
  let answer = eval(q);
  while (!config.negativesAllowed && answer < 0) {
    q = generateQuestion(config);
  }
  return q;
};

export const getAnswers = (questions: Array<string>) => {
  let answers: number[] = [];
  for (const q in questions) {
    answers.push(eval(questions[q]));
  }
  return answers;
};

export const generateQuestionArray = (
  config: questionConfig,
  amount: number
) => {
  config.operatorsAllowed = config.operatorsAllowed.map((element) =>
    element === " " ? "+" : element
  );
  let questions: string[] = [];

  for (let q = 0; q < amount; q++) {
    questions.push(generateQuestion(config));
  }

  return questions;
};

const config: questionConfig = {
  maxDigits: 3,
  numberOfTerms: 2,
  operatorsAllowed: ["+", "-", "*", "/"],
  negativesAllowed: false,
};
