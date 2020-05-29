const express = require("express");
const app = express();
const { errorHandler, errorCatch, errorGenerator, validateHook } = require("./util")
const sendHook = require("./util/webhook")

const bodyParser = require('body-parser')


app.use(bodyParser.json())

const isNumeric = (str)=> /^[0-9]+$/.test(str);

app.get("/", errorCatch(function (req, res) {
	res.send({
		success: true,
		message: "Success - Proxy root. Why are you looking here?"
	})
}));

app.post("/:id/:code", errorCatch(async function (req, res) {
	console.log("a")
	const { id, code } = req.params;
	if (isNumeric(id) && code && code !== "" && code.length > 3) {
			// Validate body
		let resp;
		try {
			resp = validateHook(req.body);

		} catch (e) {
			res.status(400).send(errorGenerator(400, e.message));
		}
		if (resp) {
			const discord = await sendHook(id, code, resp);
			if (discord === true) {
				res.send({success: true});
			} else {
				res.send(errorGenerator(0, "Discord returned an error", {discord: discord}));
			}
		}
	} else {
		res.send(400).send(errorGenerator(400, "Invalid webhook id or code. Check them and try again."))
	}
}));


app.use(errorHandler)

app.use(function (req,res) {
	res.status(404).send(errorGenerator(404, "Resource not found."))
});
process.on("uncaughtException", err => {
	console.error("There was an uncaught error", err);
});

app.listen(process.env.port || 3006, function () {
	console.log(`Listening on ${process.env.port || 3006}`);
});
