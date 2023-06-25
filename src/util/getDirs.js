const fs = require("fs/promises");

module.exports = async function (path) {
    return (await fs.readdir(path, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
}
