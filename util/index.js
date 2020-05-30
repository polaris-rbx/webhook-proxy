const errors = require("./errors");
const { isURL, isEmpty,isLength, isISO8601 } = require("validator");
const validString = (str, len)=> typeof str === "string" && !isEmpty(str) && (!len || isLength(str, { min: 1, max: len }));

const checkNum = (checkObj, targetObj, fieldName)=> {
	if (checkObj[fieldName] && !isNaN(checkObj[fieldName])) {
		targetObj[fieldName] = checkObj[fieldName];
		return true;
	} else {
		return false;
	}
};
function checkImage (image) {
	const out = {};
	if (validString(image.url)) {
		if (isURL(image.url)) {
			out["url"] = image["url"];
		}
	} else if (validString(image["proxy_url"])) {
		if (isURL(image["proxy_url"])) {
			out["proxy_url"] = image["proxy_url"];
		}
	} else {
		return { error: "Image must either have 'url' or 'proxy_url' and they must be strings." };
	}
	checkNum(image, out, "height");
	checkNum(image, out, "width");
	return out;
}


function validateEmbed (embed) {
		//https://discordapp.com/developers/docs/resources/channel#embed-object
		//https://discordapp.com/developers/docs/resources/channel#embed-limits
		const produced = {};
		const { description, title, fields, image, thumbnail, video, color, author, timestamp, url, footer } = embed;
		if (description) {
			if (!validString(description, 2048 )) {
				return { error: "Embed descriptions cannot be more than 2048 characters." };
			} else {
				produced.description = embed.description;
			}
		}
		if (title) {
			if (validString(title, 256)) {
				produced.title = title;
			} else {
				return { error: "Embed titles cannot be more than 256 characters" };
			}
		}

	if (footer) {
		if (footer.text && validString(footer.text, 2048)) {
			produced.footer = { text: footer.text };
		} else {
			return { error: "You must provide a footer text if using footer object. Max 2048 chars." };
		}

		if (footer["icon_url"]) {
			if (isURL(footer["icon_url"])) {
				produced.footer["icon_url"] = footer["icon_url"];
			} else {
				return { error: "Invalid 'footer' icon_url link." };
			}
		}
		if (footer["proxy_icon_url"]) {
			if (isURL(footer["proxy_icon_url"])) {
				produced.footer["proxy_icon_url"] = footer["proxy_icon_url"];
			} else {
				return { error: "Invalid 'footer' proxy_icon_url link." };
			}
		}
	}
	if (url) {
		if (isURL(url)) {
			produced.url = url;
		} else {
			return {error: "Invalid 'url' url field."}
		}
	}

	if (timestamp) {
		if (isISO8601(timestamp)) {
			produced.timestamp = timestamp;
		} else {
			return {error: "Invalid 'timestamp': Must comply with ISO8601."}
		}
	}

		if (image) {
			const res = checkImage(image);
			if (res.error) return res;
			produced.image = res;
		}

		if (thumbnail) {
			const res = checkImage(thumbnail);
			if (res.error) return res;
			produced.thumbnail = res;
		}
		if (video) {
			if (validString(video.url && isURL(video.url))) {
				produced.video = {
					url: video.url
				};
			} else {
				return { error: "Video must have 'url' and it must be a valid URL." };
			}
			checkNum(video, produced.video, "height");
			checkNum(video, produced.video, "width");
		}
		if (author) {
			if (author.name && validString(author.name, 256)) {
				produced.author = { name: author.name };
			} else {
				return { error: "You must provide an author name if using author object. Max 256 chars." };
			}
			if (author.url) {
				if (isURL(author.url)) {
					produced.author.url = author.url;
				} else {
					return { error: "Invalid 'author' url link." };
				}
			}

			if (author["icon_url"]) {
				if (isURL(author["icon_url"])) {
					produced.author["icon_url"] = author["icon_url"];
				} else {
					return { error: "Invalid 'author' icon_url link." };
				}
			}
			if (author["proxy_icon_url"]) {
				if (isURL(author["proxy_icon_url"])) {
					produced.author["proxy_icon_url"] = author["proxy_icon_url"];
				} else {
					return { error: "Invalid 'author' proxy_icon_url link." };
				}
			}

		}

		if (fields && Array.isArray(fields)) {
			if (fields.length > 10) {
				return { error: "There is a limit of 10 fields imposed to keep announcements clean." };
			} else {
				produced.fields = [];
				for (let counter =0; counter<fields.length; counter++) {
					const field = fields[counter];
					if (validString(field.name, 256) && validString(field.value, 1024)) {
						produced.fields.push({
							name: field.name,
							value: field.value,
							inline: !!field.inline
						});
					} else {
						return { error: `Field ${counter} is invalid: Check that both 'name' and 'value' are specified and below 256 and 1024 characters respectively.` };
					}
				}
			}
		}
		if (color) {
			if (!isNaN(color)) {
				produced.color = parseInt(color, 10);
			} else {
				return { error: "Color must be a number. Hex fields are not supported." };
			}
		}
		if (produced.title || produced.description || (produced.fields && produced.fields.length !== 1)) {
			return produced;
		} else {
			return { error: "You cannot have an empty embed, please specify either 'title', 'description' or 'fields'." };
		}

}
//https://discord.com/developers/docs/resources/webhook
function validateHook (hookInfo) {
	const out = {}
	if (hookInfo.content) {
		if (validString(hookInfo.content, 2000)) {
			out.content = hookInfo.content;
		} else {
			throw new Error("Content cannot be more than 2000 characters")
		}
	}

	if (hookInfo.username) {
		if (validString(hookInfo.username, 32) && hookInfo.username.length > 2) {
			out.username = hookInfo.username;
		} else {
			throw new Error("'username' cannot be more than 32 or less than 2 characters.")
		}
	}
	if (hookInfo.avatar_url) {
		if (isURL(hookInfo.avatar_url)) {
			out.avatar_url = hookInfo.avatar_url;
		} else {
			throw new Error("Invalid 'avatar_url' url.")
		}
	}
	if (hookInfo.tts !== undefined) {
		if (hookInfo.tts === true || hookInfo === false) {
			out.tts = hookInfo.tts;
		} else {
			throw new Error("'tts' should be a boolean or not provided.")
		}
	}

	// We do not do files.
	if (hookInfo.file) {
		out.file = hookInfo.file;
	}

	// We also don't validate allowed mentions
	if (hookInfo.allowed_mentions) {
		out.allowed_mentions = hookInfo.allowed_mentions;
	}
	if (hookInfo.embeds && hookInfo.embeds.length !== 0) {
		if (hookInfo.embeds.length > 10) {
			throw new Error("'embeds' array cannot be longer than 10.")
		}
		out.embeds = [];
		for (let counter = 0; counter < hookInfo.embeds.length; counter++) {
			const embed = hookInfo.embeds[counter];

			const resp = validateEmbed(embed);
			if (resp.error) {
				throw new Error(`${counter}: ${resp.error}`);
			} else {
				out.embeds.push(embed)
			}
		}
	}

	if (!out.content && !out.file && !out.embeds) {
		throw new Error("You must supply either 'content', 'file', or 'embeds'.")
	}


	return out;
}

module.exports = {
	...errors,
	validateHook
}
