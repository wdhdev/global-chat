const axios = require("axios");

module.exports = async function upload(token, url, userId) {
    const data = {
        token: token,
        url: url,
        userid: userId
    }

    let res;

    try {
        const request = await axios.post("http://172.19.0.13/api/upload", data);

        res = request;
    } catch(err) {
        res = err.response;
    }

    return res;
}
