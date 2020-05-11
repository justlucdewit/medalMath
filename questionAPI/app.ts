// import stuff for koa (so i can host the API)
import * as Koa from "koa";
import * as Router from "koa-router";

// import the
import { generateQuestionArray } from "./questions";
import { v4 as uuidv4 } from "uuid";

const pg = require("pg");
const connectionString =
  "postgres://postgres:{password}@localhost:5432/rekensite";
const pool = new pg.Pool({
  connectionString: connectionString,
});

const app = new Koa();
const router = new Router();

app.use(router.allowedMethods());
app.use(router.routes());

app.use(require("koa-body"));

router.get("/view", (ctx) => {
  pool.connect((err, client, done) => {
    if (err) {
      console.log("[PG ERROR]: " + err);
    } else {
      console.log("[SUCCES]");
    }
  });
});

router.get("/", (ctx) => {
  ctx.body = "api usage: do /question to get automaticly generated questions";
});

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

  const QID = uuidv4();
  ctx.body = {
    questions: generateQuestionArray(
      {
        maxDigits: max,
        numberOfTerms: terms,
        operatorsAllowed: operators,
        negativesAllowed: negatives,
      },
      count
    ),
    uuid: QID,
  };
});

app.listen(5000, function () {
  return console.log("server started");
});
