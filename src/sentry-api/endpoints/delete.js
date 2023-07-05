const schema = require("../../models/sentrySchema");

module.exports = async (req, res) => {
    if(!await schema.exists({ _id: req.params.secret })) return res.status(400).json({ "message": "Invalid capture ID.", "code": "INVALID_ID" });

    await schema.findOneAndDelete({ _id: req.params.secret });

    res.status(200).json({ "success": true });
}
