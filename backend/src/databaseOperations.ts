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
  connectionString: process.env.DATABASEURL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const query = promisify(pool.query.bind(pool));

export const insertQuestion = (QID: string, questions: string[]) => {
  // build query
  const queryString = `INSERT INTO pendingtests(uuid, time, answers) VALUES ('${QID.split(
    "-"
  ).join("")}', '${new Date()
    .toJSON()
    .replace("T", " ")
    .replace("Z", "")}', '{${getAnswers(questions)}}');`;

  // execute query
  pool.query(queryString, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.info("[info] inserted new pending test");
    }
  });
};

export const cleanPending = () => {
  const queryString = `DELETE FROM pendingtests WHERE time < now() - interval '3 hour'`;
  pool.query(queryString, (err) => {
    if (err) {
      console.error(
        "[error] an error occured while cleaning the pendingtest table: " + err
      );
    }
  });
};

export const resolvePending = async (uuid: string) => {
  const queryString = `SELECT * FROM pendingtests WHERE uuid = '${uuid}'`;
  let res = await query(queryString);
  console.log(res);
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

const isValidUsername = (un:string) => !/[^a-zA-Z_.0-9]/.test(un);
const isValidPassword = (pw:string) => pw.length > 7 && !/[^a-zA-Z0-9._!$@]/.test(pw);

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
  console.log(code);
  const queryString = `INSERT INTO productCodes(code, accsize, teacher) VALUES ('${code}', ${size}, TRUE)`;
  await query(queryString);
  return code;
}

export const redeemInvite = async (inviteCode:string, username:string, password:string) => {
  // validation
  if (!isValidUsername(username) || !isValidPassword(password)){
     return false;
  }

  const queryString = `SELECT accsize, teacher FROM productcodes WHERE code = '${inviteCode}'`;
  const res = await query(queryString);
  if (res.rows.length == 0){
    return false;
  }
  const accsize = res.rows[0].accsize;
  query(`DELETE FROM productcodes WHERE code = '${inviteCode}'`);
  console.log(res)
  if (res.rows[0].teacher){
    const uid = (await query("SELECT MAX(userid) FROM teachers")).rows[0].max + 1;
    query(`INSERT INTO teachers(userid, username, password, studentsallowed, signedup) VALUES (${uid}, '${username}', '${await bcrypt.hash(password, 10)}', ${accsize}, NOW())`);
  }

  return true;
}