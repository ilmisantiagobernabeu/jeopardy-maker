import mongoose from "mongoose";
import { SingleGame } from "../../stateTypes";

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  gameObject: { type: mongoose.Schema.Types.Mixed, required: true },
});

// Game Class
export const Game = mongoose.model("Game", gameSchema);

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

export async function getPublicGames(opts = {}) {
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

export async function createGame({
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

export async function updateGame(game: SingleGame) {
  return await Game.updateOne({ name: game.name }, { gameObject: game });
}

export async function deleteGame(gameName: string) {
  try {
    await Game.deleteOne({ name: gameName });
  } catch (err) {
    console.error("There was an deleting a game from the database...", err);
  }
}
