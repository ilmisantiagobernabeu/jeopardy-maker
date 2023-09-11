const fs = require("fs");
const path = require("path");

const gamesDirectory = path.join(__dirname, "/games");

function importAllJSONFiles(directoryPath) {
  const files = fs.readdirSync(directoryPath);

  const jsonFiles = files.filter((file) => {
    return path.extname(file) === ".json";
  });

  const importedData = {};

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

const importedGames = importAllJSONFiles(gamesDirectory);
module.exports = importedGames;
