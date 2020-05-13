// import stuff for koa (so i can host the API)
import Koa from "koa";
import Router from "koa-router";

// import some custom functions to handle question generation
// and also database opperations
import { generateQuestionArray } from "./questions";
import {
  insertQuestion,
  retrieveAllPending,
  cleanPending,
  resolvePending,
} from "./databaseOperations";

// import uuid lib so i can generate uuid's
import { v4 as uuidv4 } from "uuid";

// select port and generate the koa app
const port = 5000;
const app = new Koa();
const router = new Router();

// make koa the router
app.use(router.allowedMethods());
app.use(router.routes());

// this page is so we can view what tests are
// currently still waiting for answer submission
router.get("/view", async (ctx) => {
  await cleanPending();
  let res = await retrieveAllPending();
  ctx.body = `${res.rows.length} tests pending: \n\n`;
  for (const i in res.rows) {
    ctx.body += `id: [${res.rows[i].uuid}]\nstarted: [${res.rows[i].time}]\nanswers: [${res.rows[i].answers}]\n\n`;
  }
});

// this page is the main page, it will explain
// how to use the questions API
router.get("/", (ctx) => {
  ctx.body = "api usage: do /question to get automaticly generated questions";
});

// this page is for generating a new question
// that will be waiting in the database for the answers
router.get("/question", (ctx) => {
  cleanPending();
  const count = ctx.query.count === undefined ? 1 : ctx.query.count;
  const max = ctx.query.max === undefined ? 2 : ctx.query.max;
  const terms = ctx.query.terms === undefined ? 2 : ctx.query.terms;
  const operators: string[] =
    ctx.query.operators === undefined
      ? ["+", "-"]
      : Array.from(JSON.parse(ctx.query.operators));
  const negatives =
    ctx.query.negatives === undefined ? false : ctx.query.negatives === "true";

  const QID: string = uuidv4();
  const questions = generateQuestionArray(
    {
      maxDigits: max,
      numberOfTerms: terms,
      operatorsAllowed: operators,
      negativesAllowed: negatives,
    },
    count
  );

  ctx.body = {
    questions: questions,
    uuid: QID,
  };

  insertQuestion(QID, questions);
});

// this page is used for submitting your personal answers
// you will recieve the real answers, and the pending test
// will be wiped from the database
router.get("/submit/:uuid", async (ctx) => {
  const res = await resolvePending(ctx.params.uuid);
  ctx.body = res;
});

// create use a port to host the api
app.listen(port, function () {
  return console.log(`server started ${port}`);
});
