import request from 'request-promise';
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
    this.baseUrl = 'http://api.jwplatform.com/v1';
    this.uploadBaseUrl = 'http://upload.jwplatform.com/v1';
    this.contentBaseUrl = 'https://content.jwplatform.com';
    this.videosBaseUrl = '/videos';
    this.config = generateParams(config);
    this.secretKey = config.secretKey;
  }

  async fetchUpload(downloadUrl, customParams) {
    let videoParams = {};
    if (!downloadUrl) {
      return newError('You must provide an url to create a video');
    }
    if (customParams) {
      videoParams = customParams;
    }
    const params = concatParams(this.config, this.secretKey)({downloadUrl, ...videoParams});
    try {
      const response = await request({
        url: `${this.baseUrl}${this.videosBaseUrl}/create?${params}`,
        method: 'POST',
        headers,
        json: true
      });
      return await this.getVideo(response.video.key);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }
  batchFetchUpload(content) {
    if (!content) {
      return newError('You must provide a content in order to upload it');
    }
    const self = this;
    try {
      return content.reduce(async (acc, current) => {
        const {title, downloadUrl, tags} = current;
        const params = concatParams(self.config, self.secretKey)({downloadUrl, title, tags});
        const response = await request({
          url: `${self.baseUrl}${self.videosBaseUrl}/create?${params}`,
          method: 'POST',
          headers,
          json: true
        });
        const videoInfo = await self.getVideo(response.video.key);
        acc = await acc;
        acc.push([{...videoInfo}]);
        return acc;
      }, Promise.resolve([]));
      return Promise.all(content);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async getAllVideos(params) {
    let _params = this.config;
    if (params) {
      _params = concatParams(this.config, this.secretKey)(params);
    }
    try {
      const {videos} = await request({
        url: `${this.baseUrl}${this.videosBaseUrl}/list?${_params}`,
        headers,
        json: true
      });
      return getVideoInfo(videos);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async getVideo(videoKey) {
    if (!videoKey) {
      return new Error('You must provide a videoKey in order to get the video information!');
    }
    const params = concatParams(this.config, this.secretKey)({videoKey});
    try {
      const {video} = await request({
        url: `${this.baseUrl}${this.videosBaseUrl}/show?${params}`,
        headers,
        json: true
      });
      return getVideoInfo(video);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async deleteVideo(videoKey) {
    if (!videoKey) {
      return new Error('You must provide a videoKey in order to delete a video!');
    }
    const params = concatParams(this.config, this.secretKey)({videoKey});
    try {
      const {videos, status} = await request({
        url: `${this.baseUrl}${this.videosBaseUrl}/delete?${params}`,
        headers,
        json: true
      });
      return {videos, status};
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async updateVideoInfo(videoKey, newInfo) {
    try {
      if (!videoKey) {
        return new Error('You must provide a videoKey in order to update a video!');
      }
      const params = concatParams(this.config, this.secretKey)({videoKey, ...newInfo});
      const response = await request({
        url: `${this.baseUrl}${this.videosBaseUrl}/update?${params}`,
        json: true,
        headers
      });
      if (response.status === 'error') {
        return {status: 'Error', message: `Video with the key ${videoKey} does not exist`};
      }
      return await this.getVideo(videoKey);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async modifyThumbnail(videoKey, options) {
    if (!videoKey) {
      return new Error('You must provide a videoKey in order to update a video!');
    }
    let params = concatParams(this.config, this.secretKey)({videoKey});
    try {
      const {thumbnail: {status}} = await request({
        url: `${this.baseUrl}${this.videosBaseUrl}/thumbnails/show?${params}`,
        headers,
        json: true,
        mode
      });
      if (status === 'ready') {
        params = concatParams(this.config, this.secretKey)({videoKey, ...options});
        const response = await request({
          url: `${this.baseUrl}${this.videosBaseUrl}/thumbnails/update?${params}`,
          headers,
          json: true
        });
        return response;
      }
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async uploadThumbnail(videoKey, image) {
    if (!videoKey) {
      return new Error('You must provide a Key in order to upload a thmbnail!');
    }
    const params = concatParams(this.config, this.secretKey)({videoKey});
    const {key, token} = await getThumbnailUploadParams(
      this.config,
      this.secretKey,
      videoKey,
      request
    );
    try {
      const response = await request({
        url: `${this.uploadBaseUrl}${
          this.videosBaseUrl
        }/thumbnails/upload?api_format=json&key=${key}&token=${token}`,
        method: 'POST',
        headers,
        json: true,
        formData: {file: image}
      });
      return response;
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async uploadVideo(file, customParams) {
    let videoParams = {};
    if (!file) {
      return new Error('You must provide a file in order to upload it!');
    }
    if (customParams) {
      videoParams = customParams;
    }
    const params = concatParams(this.config, this.secretKey)({...videoParams});
    const response = await request({
      url: `${this.baseUrl}${this.videosBaseUrl}/create?${params}`,
      headers,
      json: true
    });
    const {key, token} = getUploadTokenAndKey(response);
    try {
      const uploadResponse = await request({
        url: `${this.uploadBaseUrl}${
          this.videosBaseUrl
        }/upload?api_format=json&key=${key}&token=${token}`,
        method: 'POST',
        json: true,
        headers,
        formData: {file}
      });
      return await this.getVideo(uploadResponse.media.key);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async getAllPlayers(params) {
    let _params = this.config;
    if (params) {
      _params = concatParams(this.config, this.secretKey)(params);
    }
    try {
      const {players} = await request({
        url: `${this.baseUrl}/players/list?${_params}`,
        headers,
        json: true
      });
      return getPlayerInfo(players);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async getPlayer(playerKey) {
    if (!playerKey) {
      return new Error('You must provide a playerKey in order to get a player!');
    }
    const params = concatParams(this.config, this.secretKey)({playerKey});
    try {
      const {player} = await request({
        url: `${this.baseUrl}/players/show?${params}`,
        headers,
        json: true
      });
      return getPlayerInfo(player);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async createPlayer(params) {
    if (!params) {
      return new Error('You must provide all the parameters in order to create a player!');
    }
    const _params = concatParams(this.config, this.secretKey)(params);
    try {
      const {player} = await request({
        url: `${this.baseUrl}/players/create?${_params}`,
        headers,
        json: true
      });
      return await this.getPlayer(player.key);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async deletePlayer(playerKey) {
    if (!playerKey) {
      return new Error('You must provide a playerKey in order to delete a player!');
    }
    const params = concatParams(this.config, this.secretKey)({playerKey});
    try {
      const response = await request({
        url: `${this.baseUrl}/players/delete?${params}`,
        json: true,
        headers
      });
      if (response.players.total === 1) {
        return response.players.player[0];
      }
      return players.player;
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  async updatePlayer(playerKey, newInfo) {
    if (!playerKey) {
      return new Error('You must provide a playerKey in order to update a player!');
    }
    const params = concatParams(this.config, this.secretKey)({playerKey, ...newInfo});
    try {
      const response = await request({
        url: `${this.baseUrl}/players/update?${params}`,
        json: true,
        headers
      });
      if (response.status === 'error') {
        return {status: 'Error', message: `Player with the key ${playerKey} does not exist`};
      }
      return await this.getPlayer(playerKey);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }
}

export default JWPlayerAPI;
