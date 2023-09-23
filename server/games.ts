import fs from "fs";
import path from "path";

const gamesDirectory = path.join(__dirname, "/games");

function importAllJSONFiles(directoryPath: string) {
  const files = fs.readdirSync(directoryPath);

  const jsonFiles = files
    .filter((file) => {
      return path.extname(file) === ".json";
    })
    .sort((a, b) => (a === "history-101" ? 1 : -1));

  const importedData: { [key: string]: any } = {};

  jsonFiles.forEach((file) => {
    const fileName = path.basename(file, ".json");
    const filePath = path.join(directoryPath, file);

    try {
      console.log(filePath);
      const jsonData = require(filePath);
      importedData[fileName] = jsonData;
    } catch (err) {
      console.error(`Error importing ${file}:`, err);
    }
  });

  return importedData;
}

const getImportedGames = () => importAllJSONFiles(gamesDirectory);
module.exports = getImportedGames;
