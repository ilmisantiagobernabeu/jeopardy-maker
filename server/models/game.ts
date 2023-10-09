import mongoose from "mongoose";
import { GameBoard, SingleGame } from "../../stateTypes";

type GamesFile = {
  [key: string]: {
    name: string;
    rounds: GameBoard[][];
  };
};

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  gameObject: { type: mongoose.Schema.Types.Mixed, required: true },
});

// Game Class
const Game = mongoose.model("Game", gameSchema);

type SingleGameObject = {
  name: string;
  isPublic: boolean;
  gameObject: any;
};

type GameInMongoose = (mongoose.Document<
  unknown,
  {},
  {
    name: string;
    isPublic: boolean;
    gameObject: any;
  }
> & {
  name: string;
  isPublic: boolean;
  gameObject: any;
} & {
  _id: mongoose.Types.ObjectId;
})[];

function convertToObject(publicGames: GameInMongoose) {
  return publicGames
    .sort((a, b) => (a.name === "history-101" ? -1 : 1))
    .reduce((obj, item) => {
      const stringified = JSON.stringify(item.gameObject);
      const actualObj = JSON.parse(stringified);

      obj[item.name] = {
        name: item.name,
        rounds: actualObj.rounds,
      };
      return obj;
    }, {} as any);
}

async function getPublicGames(opts = {}) {
  try {
    const publicGames = await Game.find({ isPublic: true, ...opts });

    const result = convertToObject(publicGames);

    return result;
  } catch (err: any) {
    console.error(
      "There was an issue trying to access public games: ",
      err.message
    );
  }
}

async function createGame({
  name,
  isPublic,
  gameObject,
}: {
  name: string;
  isPublic: boolean;
  gameObject: SingleGame;
}) {
  const game = new Game({
    name,
    isPublic,
    gameObject,
  });

  try {
    const result = await game.save();
    return result;
  } catch (err) {
    console.error("There was an issue saving to the database...", err);
  }
}

async function updateGame(game: SingleGame) {
  return await Game.updateOne({ name: game.name }, { gameObject: game });
}

async function deleteGame(gameName: string) {
  try {
    await Game.deleteOne({ name: gameName });
  } catch (err) {
    console.error("There was an deleting a game from the database...", err);
  }
}

module.exports.Game = Game;
module.exports.getPublicGames = getPublicGames;
module.exports.createGame = createGame;
module.exports.updateGame = updateGame;
module.exports.deleteGame = deleteGame;
module.exports.convertToObject = convertToObject;
