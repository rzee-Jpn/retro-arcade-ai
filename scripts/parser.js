const fs = require("fs");
const path = require("path");

function applyAIChanges(jsonString) {
  const data = JSON.parse(jsonString);

  data.files.forEach(file => {
    fs.mkdirSync(path.dirname(file.path), { recursive: true });
    fs.writeFileSync(file.path, file.content);
    console.log("Updated:", file.path);
  });
}

module.exports = applyAIChanges;
