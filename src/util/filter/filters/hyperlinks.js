module.exports = async function (message, role) {
    const regex = new RegExp(/\[(.*?)\]\(.*?\)/g);

    const matches = message.content.match(regex) || [];

    if(matches.length && !role.verified) {
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
