# webhook-proxy
This is a webhook proxy for Roblox to send webhooks.
I created it for myself but I've open sourced it because I thought I might as well.

# Features:
- Respects rate limits
- Validates webhook objects*


## Notes
- If someone POSTS an invalid webhook url and discord returns that it is an invalid url, it will be added to a blacklist until app restart.
- "File" and allowed mentions fields are not validated, only passed through. Why? I don't use them.
- It does not validate the overall character limit. Why? I'm lazy.

# Help
My discord: `Neztore#6998`.
