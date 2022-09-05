# shitcamp-commands

**Displays Shitcamp schedule information from [Shitcamp.live](https://shitcamp.live)**

This project is built as a [Cloudflare Worker](https://workers.cloudflare.com/). It's hosted at [https://api.fossabot.com/workers/shitcamp](https://api.fossabot.com/workers/shitcamp). You're free to use this command on your chatbots!

Supports a `type` parameter:

* `?type=latest` will return either the current activity (if one is active), or the next activity **(default)**.
* `?type=current` returns the current active activity or an error.
* `?type=next` returns the next activity or an error if none are available.

Simply add the command to your chatbot using its "custom API" functionality, for example, on [Fossabot](https://fossabot.com):

```
$(customapi https://api.fossabot.com/workers/shitcamp)
```

## Deployment

To deploy this project:

1. Clone this git repo
1. Install [wrangler2](https://developers.cloudflare.com/workers/wrangler/get-started/).
1. Run `wrangler publish`
