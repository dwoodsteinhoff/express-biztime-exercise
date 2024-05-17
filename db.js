/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;
let DB_TYPE;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql://darewood:@localhost/biztime_test";
  DB_TYPE = "biztime_test"
} else {
  DB_URI = "postgresql:///darewood:@localhost/biztime";
  DB_TYPE = "biztime"
}

console.log(DB_URI)
console.log(DB_TYPE)

// let db = new Client({
//   connectionString: DB_URI,
//   password : ""
// });

const db = new Client({
  user: 'darewood',
  password: process.env.DB_PASSWORD, 
  host: 'localhost',
  port: 5432,
  database: DB_TYPE,
})

db.connect();

module.exports = db;