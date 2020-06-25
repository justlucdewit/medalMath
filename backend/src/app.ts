// import stuff for koa (so i can host the API)
import Koa from "koa";
import serve from "koa-static";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import send from "koa-send";
import path from "path";
import fs from "fs";

// import some custom functions to handle question generation
// and also database opperations
import { generateQuestionArray } from "./questions";
import {
  redeemInvite,
  createInvite,
  insertQuestion,
  retrieveAllPending,
  cleanPending,
  getQuestion,
  resolvePending,
  credentialsValid,
} from "./databaseOperations";

// import uuid lib so i can generate uuid's
import { v4 as uuidv4 } from "uuid";

// select port and generate the koa app
const app = new Koa();
const router = new Router();

interface session {
  username:string,
  sessionID:string,
}

let sessions:session[] = [];

// make koa the router
app.use(bodyParser());
app.use(router.allowedMethods());
app.use(router.routes());
app.use(async (ctx) => {
  await send(ctx, ctx.path, { root: __dirname + '/../../docs' });
});

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

router.get("/exercises", async (ctx, next) => {
  let session = sessions.find( ses => ses.sessionID === ctx.cookies.get('session') && ses.username === ctx.cookies.get('username'));
  if (session === undefined) {
    ctx.redirect("/");
  }

  let QID = await createQuestion();
  ctx.cookies.set('uuid', QID, {httpOnly: false});
  await send (ctx, "docs/exercises.html");
});

router.get("/api/:id", async (ctx, next) => {
  let questions = await getQuestion(ctx.params.id);
  ctx.body = questions;
});

// this page is the main page, it will explain
// how to use the questions API
router.get("/", async (ctx, next) => {
  console.log("[INFO] served 'login page'");
  await send(ctx, "docs/login.html");
  return next();
})

router.post("/", async (ctx, next) => {
  console.log("[INFO] served home page");

  if (!await credentialsValid(ctx.request.body.username, ctx.request.body.password)){
    console.log(`[INFO] ${ctx.request.body.username} failed to login`);
    ctx.redirect("/?error=Password or username incorrect, probeer opnieuw");
    return next();
  }else{
    const sessionID = uuidv4();
    sessions.push({sessionID: sessionID, username: ctx.request.body.username});
    ctx.cookies.set('session', sessionID, {httpOnly: false});
    ctx.cookies.set('username', ctx.request.body.username);
    console.log(`[INFO] ${ctx.request.body.username} logged in`);
  }

  await send(ctx, "docs/index.html");
  return next();
});

// this page is for generating a new question
// that will be waiting in the database for the answers
const createQuestion = async () => {
  cleanPending();
  let qid = uuidv4();
  const questions = generateQuestionArray(
    {
      maxDigits: 2,
      numberOfTerms: 2,
      operatorsAllowed: ["+", "-"],
      negativesAllowed: true,
    },
    10
  );

  await insertQuestion(qid, questions);
  return qid
};

// this page is used for submitting your personal answers
// you will recieve the real answers, and the pending test
// will be wiped from the database
// router.get("/submit/:uuid", async (ctx) => {
//   const res = await resolvePending(ctx.params.uuid);
//   ctx.body = res;
// });

router.get("/invite/:masterKey/:size", async (ctx) => {
  if (ctx.params.masterKey != process.env.masterKey || !ctx.params.size) {
    ctx.body = "invalid master key";
  }else{
    const code = await createInvite(ctx.params.size);
    ctx.body = code;
    console.log("[INFO] created new productCode");
  }
});

// router.get("/redeem/:code/:name/:pass", async (ctx) => {
//   const done = await redeemInvite(ctx.params.code, ctx.params.name, ctx.params.pass);
//   if (done){
//     console.log(`[INFO] created new account named ${ctx.params.name} using code ${ctx.params.code}`);
//   } else {
//     console.log(`[INFO] failed to redeem account`);
//   }
// });

router.get("/register", async (ctx, next) => {
  console.log("[INFO] served 'register page'");
  await send(ctx, "docs/register.html");
});

router.post("/register", async (ctx, next) => {
  const pr = ctx.request.body;
  const status = await redeemInvite(pr.productcode, pr.username, pr.password[0]);

  // check password match
  if (pr.password[0] != pr.password[1]){
    console.log("[INFO] register with non matching password");
    ctx.redirect("/register.html?error=Passwords zijn niet hetzelfde");
  }

  
  else if (status != true){
    console.log("[INFO] register failed");
    ctx.redirect(`/register.html?error=${status}`);
  }else{
    console.log("[INFO] registered new user!");
    ctx.redirect('/?success=registratie gelukt!');

    ctx.body = "success!";
  }  
});

// create use a port to host the api
app.listen(process.env.PORT, () => {
  return console.log(`server started on port ${process.env.PORT}`);
});
