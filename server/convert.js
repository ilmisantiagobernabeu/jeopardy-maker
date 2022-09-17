let csvToJson = require("convert-csv-to-json");

function formatCSVToJSON(fileInputName) {
  let json1 = csvToJson.fieldDelimiter(",").getJsonFromCsv(fileInputName);

  const json = json1.reduce((obj, currentObj, index) => {
    const objArr = Object.entries(currentObj);

    objArr.forEach(([categoryName, clue]) => {
      if (obj[categoryName]) {
        obj[categoryName].push(clue);
      } else {
        obj[categoryName] = [clue];
      }
    });

    return obj;

    // const clues =
  }, {});

  return Object.entries(json).map(([categoryName, clues]) => ({
    category: categoryName,
    clues: clues.map((clue) => ({ text: clue, answer: "" })),
  }));
}

module.exports = {
  formatCSVToJSON,
};
