module.exports = async function (message, role) {
    const regex = new RegExp(/^#{1,4}\s(?!.*\[#.*\]$).*/gm);

    const matches = message.content.match(regex) || [];

    if(matches.length) {
        return {
            "result": true,
            "matches": matches
        }
    } else {
        return {
            "result": false
        }
    }
}
