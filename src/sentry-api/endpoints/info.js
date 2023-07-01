const schema = require("../../models/sentrySchema");

module.exports = async (req, res) => {
    if(!await schema.exists({ _id: req.params.secret })) return res.status(400).json({ "message": "Invalid capture ID.", "code": "INVALID_ID" });

    const data = await schema.findOne({ _id: req.params.secret });

    res.status(200).json({
        "id": data.id,
        "project": data.project,
        "channel": data.channel,
        "registered": data.registered,
        "user": data.user
    })
}
