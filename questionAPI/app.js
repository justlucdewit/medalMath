"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// import stuff for koa (so i can host the API)
var Koa = require("koa");
var Router = require("koa-router");
// import some custom functions to handle question generation
// and also database opperations
var questions_1 = require("./questions");
var databaseOperations_1 = require("./databaseOperations");
// import uuid lib so i can generate uuid's
var uuid_1 = require("uuid");
// select port and generate the koa app
var port = 5000;
var app = new Koa();
var router = new Router();
// make koa the router
app.use(router.allowedMethods());
app.use(router.routes());
// this page is so we can view what tests are
// currently still waiting for answer submission
router.get("/view", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var res, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, databaseOperations_1.retrieveAllPending()];
            case 1:
                res = _a.sent();
                ctx.body = res.rows.length + " tests pending: \n\n";
                for (i in res.rows) {
                    ctx.body += "id: [" + res.rows[i].uuid + "]\nstarted: [" + res.rows[i].time + "]\nanswers: [" + res.rows[i].answers + "]\n\n";
                }
                return [2 /*return*/];
        }
    });
}); });
// this page is the main page, it will explain
// how to use the questions API
router.get("/", function (ctx) {
    ctx.body = "api usage: do /question to get automaticly generated questions";
});
// this page is for generating a new question
// that will be waiting in the database for the answers
router.get("/question", function (ctx) {
    var count = ctx.query.count === undefined ? 1 : ctx.query.count;
    var max = ctx.query.max === undefined ? 2 : ctx.query.max;
    var terms = ctx.query.terms === undefined ? 2 : ctx.query.terms;
    var operators = ctx.query.operators === undefined
        ? ["+", "-"]
        : Array.from(JSON.parse(ctx.query.operators));
    var negatives = ctx.query.negatives === undefined ? false : ctx.query.negatives === "true";
    var QID = uuid_1.v4();
    var questions = questions_1.generateQuestionArray({
        maxDigits: max,
        numberOfTerms: terms,
        operatorsAllowed: operators,
        negativesAllowed: negatives
    }, count);
    ctx.body = {
        questions: questions,
        uuid: QID
    };
    databaseOperations_1.insertQuestion(QID, questions);
});
// create use a port to host the api
app.listen(port, function () {
    return console.log("server started " + port);
});
