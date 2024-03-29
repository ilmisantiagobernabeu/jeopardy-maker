import mongoose from "mongoose";
import { SingleGame } from "../../stateTypes";

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
    gameObject: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Game Class
export const Game = mongoose.model("Game", gameSchema);

type GameInMongoose = (mongoose.Document<
  unknown,
  {},
  {
    name: string;
    userId: string;
    isPublic: boolean;
    gameObject: any;
  }
> & {
  name: string;
  userId: string;
  isPublic: boolean;
  gameObject: any;
} & {
  _id: mongoose.Types.ObjectId;
})[];

function convertToObject(publicGames: GameInMongoose) {
  return publicGames.reduce((obj, item) => {
    const stringified = JSON.stringify(item.gameObject);
    const actualObj = JSON.parse(stringified);

    obj[item.name] = {
      name: item.name,
      isPublic: item.isPublic,
      userId: item.userId,
      rounds: actualObj.rounds,
    };
    return obj;
  }, {} as any);
}

export async function getPublicGames(opts = {}) {
  try {
    const publicGames = await Game.find({ isPublic: true, ...opts }).sort({
      updatedAt: -1,
    });

    const result = convertToObject(publicGames);

    return result;
  } catch (err: any) {
    console.error(
      "There was an issue trying to access public games: ",
      err.message
    );
  }
}

export async function getUserGames(userId: string) {
  try {
    const publicGames = await Game.find({
      $or: [{ isPublic: true }, { userId }],
    }).sort({ updatedAt: -1 });

    const result = convertToObject(publicGames);

    return result;
  } catch (err: any) {
    console.error(
      "There was an issue trying to access user games: ",
      err.message
    );
  }
}

export async function createGame({
  name,
  userId,
  isPublic,
  gameObject,
}: {
  name: string;
  userId: string;
  isPublic: boolean;
  gameObject: SingleGame;
}) {
  // stripping out 'alreadyPlayed' when saving to mongo
  const formattedGameObject = { ...gameObject };
  formattedGameObject.rounds.map((round) =>
    round.map((col) => ({
      ...col,
      clues: col.clues.map((col) => {
        const { alreadyPlayed, ...rest } = col;
        return rest;
      }),
    }))
  );

  const game = new Game({
    name,
    userId,
    isPublic,
    gameObject: formattedGameObject,
  });

  try {
    const result = await game.save();
    return result;
  } catch (err) {
    console.error("There was an issue saving to the database...", err);
  }
}

export async function updateGame(
  previousGameName: string,
  gameObject: SingleGame
) {
  // stripping out 'alreadyPlayed' when saving to mongo
  const formattedGameObject = { ...gameObject };
  formattedGameObject.rounds.map((round) =>
    round.map((col) => ({
      ...col,
      clues: col.clues.map((col) => {
        const { alreadyPlayed, ...rest } = col;
        return rest;
      }),
    }))
  );

  try {
    await Game.updateOne(
      { name: previousGameName },
      { name: gameObject.name, gameObject }
    );
  } catch (err) {
    console.error(
      "There was an issue updating a game board ",
      previousGameName,
      gameObject.name
    );
  }
}

export async function deleteGame(gameName: string) {
  try {
    await Game.deleteOne({ name: gameName });
    console.log(`Successfully deleted the ${gameName} game`);
  } catch (err) {
    console.error("There was an deleting a game from the database...", err);
  }
}
