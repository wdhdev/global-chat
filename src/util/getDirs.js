const { readdir } = require("fs/promises");

module.exports = async function (source) {
    return (await readdir(source, { withFileTypes: true }))
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
}
