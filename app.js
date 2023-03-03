const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
  }
};

initializeDbAndServer();

//API
const convertPlayerDbObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team;`;
  const playerQueryResponse = await db.all(getPlayersQuery);
  response.send(
    playerQueryResponse.map((eachPlayer) => convertPlayerDbObject(eachPlayer))
  );
});

//API2
//Creates a new player in the team (database). `player_id` is auto-incremented
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `insert into cricket_team(player_name,jersey_number,role)
    values('${playerName}',${jerseyNumber},'${role}');`;
  const postPlayerQueryResponse = await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//API3
//Returns a player based on a player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id=${playerId};`;
  const getPlayerQueryResponse = await db.get(getPlayerQuery);
  response.send(convertPlayerDbObject(getPlayerQueryResponse));
});

//API4
//Updates the details of a player in the team (database) based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const putPlayerQuery = `update cricket_team set 
    player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}'
    where player_id=${playerId};`;
  await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});

//API5
//Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete from cricket_team where player_id=${playerId};`;
  const deletePlayerQueryResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
