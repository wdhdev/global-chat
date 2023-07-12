module.exports = async function (message, role) {
    const urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

    const linkMatches = message.content.match(urlRegex) || [];

    if(linkMatches.length && !role.verified) {
        return {
            "result": true,
            "links": linkMatches
        }
    } else {
        return {
            "result": false
        }
    }
}