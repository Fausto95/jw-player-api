import fetch from 'isomorphic-fetch';
import 'es6-promise';
import {
  headers,
  mode,
  generateParams,
  getVideoInfo,
  concatParams,
  getUploadTokenAndKey
} from './utils';

class JWPlayerAPI {
  constructor(config) {
    this.baseUrl = 'https://api.jwplatform.com/v1';
    this.uploadBaseUrl = 'https://upload.jwplatform.com/v1';
    this.contentBaseUrl = 'https://content.jwplatform.com';
    this.config = generateParams(config);
    this.secretKey = config.secretKey;
    this.videosBaseUrl = '/videos';
  }

  async getAllVideos(params) {
    let _params = this.config;
    if (params) {
      _params = concatParams(this.config, this.secretKey)(params);
    }
    const {videos} = await (await fetch(`${this.baseUrl}${this.videosBaseUrl}/list?${_params}`, {
      headers,
      mode
    })).json();
    return getVideoInfo(videos);
  }

  getVideo(id) {
    if (!id) {
      return new Error('You must provide an id in order to get the video information!');
    }
    let params = concatParams(this.config, this.secretKey)({videoKey: id});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/show?${params}`, {headers, mode})
      .then(res => res.json())
      .then(res => {
        return getVideoInfo(res.video);
      })
      .catch(err => new Error('No video to show'));
  }

  deleteVideo(id) {
    if (!id) {
      return new Error('You must provide an id in order to delete a video!');
    }
    let params = concatParams(this.config, this.secretKey)({videoKey: id});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/delete?${params}`, {headers, mode})
      .then(res => res.json())
      .then(res => {
        let message = res.videos[id];
        if (message === 'not-found') {
          return {status: 'Error', message: `Video with the key ${id} does not exist`};
        }
        return {status: 'Success', message: `Video with key ${id} has been deleted`};
      })
      .catch(err => new Error('An error occurred while trying to delete the video!'));
  }

  updateVideo(id, newInfo) {
    if (!id) {
      return new Error('You must provide an id in order to update a video!');
    }
    let params = concatParams(this.config, this.secretKey)({videoKey: id, ...newInfo});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/update?${params}`, {headers, mode})
      .then(res => res.json())
      .then(res => {
        if (res.status === 'error') {
          return {status: 'Error', message: `Video with the key ${id} does not exist`};
        }
        return this.getVideo(id);
      })
      .catch(err => new Error('An error occurred while trying to update the video information!'));
  }

  postVideo(file, customParams) {
    let videoParams;
    if (!file) {
      return new Error('You must provide a file in order to upload it!');
    }
    if (customParams) {
      videoParams = customParams;
    }
    let params = concatParams(this.config, this.secretKey)({...videoParams});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/create?${params}`, {headers, mode})
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
            mode,
            body: file
          }
        )
          .then(res => res.json())
          .then(res => res)
          .catch(err => new Error('An error occurred while trying to upload the file!'));
      })
      .catch(err => new Error(err));
  }
}

export default JWPlayerAPI;
