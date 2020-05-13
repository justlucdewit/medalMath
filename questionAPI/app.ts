// import stuff for koa (so i can host the API)
import * as Koa from "koa";
import * as Router from "koa-router";

// import some custom functions to handle question generation
// and also database opperations
import { generateQuestionArray } from "./questions";
import { insertQuestion, retrieveAllPending } from "./databaseOperations";

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

// create use a port to host the api
app.listen(port, function () {
  return console.log(`server started ${port}`);
});
