// Handles webhook & ratelimiting
const fetch = require("node-fetch");

let ratelimitApplied = false;
const invalidHooks = {};
async function sendWebhook (webhookId, webhookCode, body) {
	if (ratelimitApplied) {
		return {
			message: "Ratelimit applied"
		}
	}
	const resp = await fetch(`https://ptb.discord.com/api/webhooks/${webhookId}/${webhookCode}`, {
		method: "POST",
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(body)
	});
	if (resp.ok) {
		if (parseInt(resp.headers["x-ratelimit-remaining"], 10) === 0) {
			ratelimitApplied = true;
			setTimeout(function () {
				ratelimitApplied = false;
			}, resp.headers["X-RateLimit-Reset-After"] * 1000)
		}
		return true;
	} else {
		const body = await resp.json()
		if (body.code === 10015) {
			invalidHooks[webhookId] = true;
		} else if (resp.status === 429) {
		ratelimitApplied = true;
		setTimeout(function () {
			ratelimitApplied = false;
		}, resp.headers["X-RateLimit-Reset-After"] * 1000)
	} else {
			console.error(`${body.code}: ${body.message}`)
		}
	return body;
	}
}
module.exports = sendWebhook;
