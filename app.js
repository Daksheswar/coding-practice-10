const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const bcrypt = require("bcrypt");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("server is running at http://localhost:4000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectQuery = `
    SELECT * FROM user WHERE username=${username};`;
  const dbUser = await db.run(selectQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    if (dbUser !== undefined) {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched == true) {
        const payload = {
          username: username,
        };
        const jwtToken = jwt.sign(payload, "dakshi");
        response.send(jwtToken);
      } else {
        response.status(400);
        response.send("Invalid password");
      }
    }
  }
});
