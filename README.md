🚨🚨🚨 STALE 🚨🚨🚨

> While this library might still work, I'm no longer maintaining it. Feel free to fork and patch if needed.


`Examples`: https://repl.it/@Fausto95/jwplayer-sdk

`API-Reference`: https://jwplayer-sdk.netlify.com/

# 🔧 Installation
```shell
yarn add jwplayer-sdk
```
# ⚙️ Usage

```js



// ES Modules
import JWPlayer from 'jwplayer-sdk';

//initializating...
const JWAPI = new JWPlayer({
  apiKey: 'your apiKey goes here',
  secretKey: 'your secreteKey goes here',
});


const videos = await JWAPI.getAllVideos(params); // params are optional
/*
  result: [
    {
      views: 0,
      height: 400,
      cloudHostedPlayer: 'https://content.jwplatform.com/libraries/dfNGJds0.js',
      key: 'dfNGJds0',
      skin: { type: 'built-in', name: 'Default', key: 'M03UUDt9' },
      responsive: false,
      playlist: 'none',
      releaseChannel: 'production',
      name: 'My Player',
      custom: {},
      width: 400,
      version: '8',
      ltasChannel: null
    }
  ]
*/
```

### Current Available Features:

```typescript
// Player
  .getAllPlayers(params: Object) // Optional
  .getPlayer(playerKey: String) // Required
  .createPlayer(params: Object) // Required
  .updatePlayer(playerKey: String, params: Object) // Both required
  .deletePlayer(playerKey: String) // Required

// Videos
  .getAllVideos(params: Object) // Optional
  .getVideo(videoKey: String) // Required
  .uploadVideo(file: ReadableStream, params: Object) // Params is optional
  .fetchUpload(url: String, params: Object) // Url is Required
  .batchFetchUpload(content: Object) // Content is Required
  .updateVideo(videoKey: String, params: Object) // Both required
  .deleteVideo(videoKey: String) // Required

//Videos Thumbnails
  .modifyThumbnailFrame(videoKey: String, params: Object) // Both Required
  .uploadThumbnail(videoKey: String, imageFile: ReadableStream) // Both Required
````

## Contributing

You must have a JwPlayer account!
Clone the repo
```shell
git clone https://github.com/Fausto95/jw-player-api.git
```
Install the dependencies
```shell
npm install
```

Make your changes, test and send a PR

## Roadmap (API)
- [ ] /accounts
- [ ] /accounts/tags
- [ ] /accounts/usage
- [ ] /channels
- [ ] /channels/videos
- [x] /players
- [ ] /status
- [x] /videos
- [ ] /videos/converstations
- [ ] /videos/tags
- [x] /videos/thumbnails
- [ ] /videos/tracks
- [x] /fetch-upload

## License

MIT
