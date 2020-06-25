import { getAnswers } from "./questions";
import { promisify } from "util";
import bcrypt from "bcrypt";

require("dotenv").config();

const possibleCodes = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
"n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7,
8, 9];

// initialize database connection
const pg = require("pg");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const query = promisify(pool.query.bind(pool));

export const insertQuestion = async (QID: string, questions: string[]) => {
  // build query
  const queryString = `INSERT INTO pendingtests(uuid, time, answers, questions) VALUES ('${QID.split("-").join("")}', NOW(), '{${getAnswers(questions)}}', '{ ${questions.toString()} }');`;

  // execute query
  await query(queryString);
  console.log("[INFO] started new exercise");
};

export const cleanPending = () => {
  const queryString = `DELETE FROM pendingtests WHERE time < now() - interval '3 hour'`;
  query(queryString)
  console.log("[INFO] cleaned the database");
};

export const resolvePending = async (uuid: string) => {
  const queryString = `SELECT * FROM pendingtests WHERE uuid = '${uuid}'`;
  let res = await query(queryString);
  if (res.rows.length === 0) {
    console.error(
      "[error] somone tried submitting a pendingtest that wasnt stored anymore"
    );
    return "something went wrong, unfortunatly this means that you will have to do the test again :(\nthis could happen if you take longer then 3 hours for 1 test";
  }

  query(`DELETE FROM pendingtests WHERE uuid = '${uuid}'`);
  return res.rows[0];
};

export const retrieveAllPending = async () => {
  const queryString = "SELECT * FROM pendingtests";
  return await query(queryString);
};

const isValidProductcode = (pc:string) => !/[^a-z0-9]/.test(pc) && pc.length === 16;
const isValidUsername = (un:string) => !/[^a-zA-Z_.0-9]/.test(un);
const isValidPassword = (pw:string) => pw.length > 7 && !/[^a-zA-Z0-9._!$@]/.test(pw);
const isValidQID = (qid:string) => qid.length == 36 && !/[^0-9a-z-]/.test(qid);

export const credentialsValid = async (username:string, password:string) => {
  // anti SQL injections
  if (!isValidUsername(username)){
    return false;
  }

  const queryString = `SELECT password FROM teachers WHERE username = '${username}'`;
  const res = await query(queryString);
  if (res.rows.length > 0 && await bcrypt.compare(password, res.rows[0].password)){
    return true
  }
  return false;
}

export const createInvite = async (size:number) => {
  let code = "";
  for (let i = 0; i < 16; i++){
    code+=possibleCodes[Math.floor(Math.random()*possibleCodes.length)];
  }
  console.log("[INFO] created productcode "+code);
  const queryString = `INSERT INTO productCodes(code, accsize, teacher) VALUES ('${code}', ${size}, TRUE)`;
  query(queryString);
  return code;
}

const usernameFree = async (username:string) => (await query(`SELECT userid FROM teachers WHERE username = '${username}'`)).rows.length == 0;

export const redeemInvite = async (inviteCode:string, username:string, password:string) => {
  // validation
  if (!isValidUsername(username)){
    return "Username is niet geldig, username mag alleen letters, _ of . bevatten";
  } else if (!isValidPassword(password)){
    return "Password moet minstens 8 tekens bevatten, en mag alleen letters, nummers @, !, _, $ of . bevatten";
  } else if (!await usernameFree(username)){
     return "Username is al in gebruik";
  } else if (!isValidProductcode(inviteCode)){
    return "er zit een fout in de product code, heb je het misspelt? anders neem contact op met de site admin";
  }

  const queryString = `SELECT accsize, teacher FROM productcodes WHERE code = '${inviteCode}'`;
  const res = await query(queryString);
  if (res.rows.length == 0){
    return "er zit een fout in de product code, heb je het misspelt? anders neem contact op met de site admin";
  }
  const accsize = res.rows[0].accsize;
  query(`DELETE FROM productcodes WHERE code = '${inviteCode}'`);
  if (res.rows[0].teacher){
    const uid = (await query("SELECT MAX(userid) FROM teachers")).rows[0].max + 1;
    query(`INSERT INTO teachers(userid, username, password, studentsallowed, signedup) VALUES (${uid}, '${username}', '${await bcrypt.hash(password, 10)}', ${accsize}, NOW())`);
  }

  return true;
}

export const getQuestion = async (id:string) => {
  if (isValidQID(id)) {
    const queryString = `SELECT questions FROM pendingtests WHERE uuid = '${id.split("-").join("")}';`;
    const res = await query(queryString);
    console.log(res.rows[0]);
    if (res.rows.length == 0) {
      console.log("[ERROR] someone tried to get a question with invalid QID");
      return {};
    } else {
      return res.rows[0];
    }

  } else {
    console.log("[ERROR] someone tried to get a question with invalid QID");
    return {};
  }
};