const fs = require("fs");

const data = fs.readFileSync("src/resources/easter-eggs.json", "utf8");
const easterEggs = JSON.parse(data);

module.exports = function (content) {
    let returnedContent = content;

    for(const [key, value] of Object.entries(easterEggs.insensitive)) {
        if(content.toLowerCase() === key) {
            returnedContent = value;
            break;
        }
    }

    for(const [key, value] of Object.entries(easterEggs.sensitive)) {
        if(content === key) {
            returnedContent = value;
            break;
        }
    }

    return returnedContent;
}
