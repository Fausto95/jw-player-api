import fetch from 'isomorphic-fetch';
import 'es6-promise';
import {
  headers,
  mode,
  generateParams,
  getVideoInfo,
  concatParams,
  getUploadTokenAndKey,
  getThumbnailUploadParams,
  getPlayerInfo
} from './utils';

class JWPlayerAPI {
  constructor(config) {
    this.baseUrl = 'https://api.jwplatform.com/v1';
    this.uploadBaseUrl = 'https://upload.jwplatform.com/v1';
    this.contentBaseUrl = 'https://content.jwplatform.com';
    this.config = config;
    this.secretKey = config.secretKey;
    this.videosBaseUrl = '/videos';
  }

  async getAllVideos(params) {
    if (params) {
      params = generateParams(this.config, ...params);
    }
    params = generateParams(this.config);
    const videos = await (await fetch(`${this.baseUrl}${this.videosBaseUrl}/list?${params}`, {
      mode
    })).json();
    return videos;
  }

  getVideo(videoKey) {
    if (!videoKey) {
      return new Error('You must provide a videoKey in order to get the video information!');
    }
    const params = generateParams(this.config, {videoKey});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/show?${params}`)
      .then(res => res.json())
      .then(res => {
        return getVideoInfo(res.video);
      })
      .catch(err => new Error(err));
  }

  deleteVideo(videoKey) {
    if (!videoKey) {
      return new Error('You must provide a videoKey in order to delete a video!');
    }
    const params = generateParams(this.config, {videoKey});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/delete?${params}`)
      .then(res => res.json())
      .then(res => {
        if (res.videos.total === 1) {
          return res.videos.video[0];
        }
        return videos.videos;
      })
      .catch(err => new Error(err));
  }

  updateVideoInfo(videoKey, newInfo) {
    if (!videoKey) {
      return new Error('You must provide a videoKey in order to update a video!');
    }
    const params = generateParams(this.config, {videoKey, ...newInfo});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/update?${params}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'error') {
          return {status: 'Error', message: `Video with the key ${videoKey} does not exist`};
        }
        return this.getVideo(videoKey);
      })
      .catch(err => new Error(err));
  }

  async modifyThumbnail(videoKey, options) {
    if (!videoKey) {
      return new Error('You must provide a videoKey in order to update a video!');
    }
    let params = generateParams(this.config, {videoKey});
    const {thumbnail: {status}} = await (await fetch(
      `${this.baseUrl}${this.videosBaseUrl}/thumbnails/show?${params}`,
      {headers, mode}
    )).json();
    if (status === 'ready') {
      params = generateParams(this.config, {videoKey, ...options});
      return fetch(`${this.baseUrl}${this.videosBaseUrl}/thumbnails/update?${params}`)
        .then(res => res.json())
        .then(res => res)
        .catch(err => err);
    }
    return new Error("This video's thumbnail cannot be modified");
  }

  async uploadThumbnail(videoKey, image) {
    if (!videoKey) {
      return new Error('You must provide a Key in order to upload a thmbnail!');
    }
    const params = generateParams(this.config, {videoKey});
    const {key, token} = await getThumbnailUploadParams(
      this.config,
      this.secretKey,
      videoKey,
      fetch
    );
    return fetch(
      `${this.uploadBaseUrl}${
        this.videosBaseUrl
      }/thumbnails/upload?api_format=json&key=${key}&token=${token}`,
      {
        method: 'POST',
        headers,
        body: image
      }
    )
      .catch(err => new Error(err))
      .then(res => {
        if (res.status === 412 || res.statusText === 'Unsupported Media Type') {
          new Error({status: 'Failed', message: response.statusText});
        }
        return res.json();
      })
      .then(res => res);
  }

  uploadVideo(file, customParams) {
    let videoParams = {};
    if (!file) {
      return new Error('You must provide a file in order to upload it!');
    }
    if (customParams) {
      videoParams = customParams;
    }
    const params = generateParams(this.config, {...videoParams});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/create?${params}`)
      .then(res => res.json())
      .then(res => {
        const {key, token} = getUploadTokenAndKey(res);
        return;
        fetch(
          `${this.uploadBaseUrl}${
            this.videosBaseUrl
          }/upload?api_format=json&key=${key}&token=${token}`,
          {
            method: 'POST',
            headers,
            body: file
          }
        )
          .then(res => res.json())
          .then(res => this.getVideo(res.media.key))
          .catch(err => new Error(err));
      })
      .catch(err => new Error(err));
  }

  async getAllPlayers(params) {
    if (params) {
      params = generateParams(this.config, ...params);
    }
    params = generateParams(this.config);
    const {players} = await (await fetch(`${this.baseUrl}/players/list?${params}`)).json();
    return getPlayerInfo(players);
  }

  async getPlayer(playerKey) {
    if (!playerKey) {
      return new Error('You must provide a playerKey in order to get a player!');
    }
    const params = generateParams(this.config, {playerKey});
    const {player} = await (await fetch(`${this.baseUrl}/players/show?${params}`)).json();
    return getPlayerInfo(player);
  }

  async createPlayer(params) {
    if (!params) {
      return new Error('You must provide all the parameters in order to create a player!');
    }
    params = generateParams(this.config, ...params);
    const {player} = await (await fetch(`${this.baseUrl}/players/create?${params}`, {
      headers
    })).json();
    return this.getPlayer(player.key);
  }

  deletePlayer(playerKey) {
    if (!playerKey) {
      return new Error('You must provide a playerKey in order to delete a player!');
    }
    const params = generateParams(this.config, {playerKey});
    return fetch(`${this.baseUrl}/players/delete?${params}`)
      .then(res => res.json())
      .then(res => {
        if (res.players.total === 1) {
          return res.players.player[0];
        }
        return players.player;
      })
      .catch(err => new Error(err));
  }

  updatePlayer(playerKey, newInfo) {
    if (!playerKey) {
      return new Error('You must provide a playerKey in order to update a player!');
    }
    const params = generateParams(this.config, {playerKey, ...newInfo});
    return fetch(`${this.baseUrl}/players/update?${params}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'error') {
          return {status: 'Error', message: `Player with the key ${playerKey} does not exist`};
        }
        return this.getPlayer(playerKey);
      })
      .catch(err => new Error(err));
  }
}

export default JWPlayerAPI;
