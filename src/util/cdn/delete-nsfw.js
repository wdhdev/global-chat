const axios = require("axios");

module.exports = async function deleteNSFW(token, file, userId) {
    let res;

    try {
        const request = await axios.delete("http://172.19.0.13/api/delete/nsfw", {
            headers: {
                "file": file,
                "token": token,
                "userid": userId
            }
        })

        res = request;
    } catch(err) {
        res = err.response;
    }

    return res;
}
