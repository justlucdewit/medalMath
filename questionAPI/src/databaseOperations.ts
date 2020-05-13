import { getAnswers } from "./questions";
import { promisify } from "util";

// initialize database connection
const pg = require("pg");
const connectionString = "postgres://postgres:sheba1@localhost:5432/rekensite";
const pool = new pg.Pool({ connectionString: connectionString });
const query = promisify(pool.query.bind(pool));

export const insertQuestion = (QID: string, questions: string[]) => {
  // build query
  const query = `INSERT INTO pendingtests(uuid, time, answers) VALUES ('${QID.split(
    "-"
  ).join("")}', '${new Date()
    .toJSON()
    .replace("T", " ")
    .replace("Z", "")}', '{${getAnswers(questions)}}');`;

  pool.query(query, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.info("[info] inserted new pending test");
    }
  });
};

export const retrieveAllPending = async () => {
  const queryString = "SELECT * FROM pendingtests";
  return await query(queryString);
};
