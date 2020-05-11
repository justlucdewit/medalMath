"use strict";
exports.__esModule = true;
// import stuff for koa (so i can host the API)
var Koa = require("koa");
var Router = require("koa-router");
// import the
var questions_1 = require("./questions");
var uuid_1 = require("uuid");
var pg = require("pg");
var connectionString = "postgres://postgres:{password}@localhost:5432/rekensite";
var pool = new pg.Pool({
    connectionString: connectionString
});
var app = new Koa();
var router = new Router();
app.use(router.allowedMethods());
app.use(router.routes());
app.use(require("koa-body"));
router.get("/view", function (ctx) {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("[PG ERROR]: " + err);
        }
        else {
            console.log("[SUCCES]");
        }
    });
});
router.get("/", function (ctx) {
    ctx.body = "api usage: do /question to get automaticly generated questions";
});
router.get("/question", function (ctx) {
    var count = ctx.query.count === undefined ? 1 : ctx.query.count;
    var max = ctx.query.max === undefined ? 2 : ctx.query.max;
    var terms = ctx.query.terms === undefined ? 2 : ctx.query.terms;
    var operators = ctx.query.operators === undefined
        ? ["+", "-"]
        : Array.from(JSON.parse(ctx.query.operators));
    var negatives = ctx.query.negatives === undefined ? false : ctx.query.negatives === "true";
    var QID = uuid_1.v4();
    ctx.body = {
        questions: questions_1.generateQuestionArray({
            maxDigits: max,
            numberOfTerms: terms,
            operatorsAllowed: operators,
            negativesAllowed: negatives
        }, count),
        uuid: QID
    };
});
app.listen(5000, function () {
    return console.log("server started");
});
