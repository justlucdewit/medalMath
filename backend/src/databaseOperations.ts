import { getAnswers } from "./questions";
import { promisify } from "util";

require("dotenv").config();

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

export const credentialsValid = (username:string, password:string) => {
  return false;
}
