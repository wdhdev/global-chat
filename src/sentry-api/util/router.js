const { Router } = require("express");

const router = Router();
const routes = require("./routes");

const client = require("../../index");
const Discord = require("discord.js");

router.get("/info/:secret", async (req, res) => {
    routes.info(req, res);
})

router.post("/:secret", async (req, res) => {
    routes.index(req, res, client, Discord);
})

module.exports = router;
