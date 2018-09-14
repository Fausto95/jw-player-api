import {
  generateParams,
  getVideosLinks,
  getVideoLink,
  toCamelCase,
  concatParams,
  getUploadTokenAndKey
} from './utils';

class JWPlayerAPI {
  constructor(config) {
    this.baseUrl = 'http://api.jwplatform.com/v1';
    this.uploadBaseUrl = 'http://upload.jwplatform.com/v1';
    this.contentBaseUrl = 'https://content.jwplatform.com';
    this.config = generateParams(config);
    this.secretKey = config.secretKey;
    this.videosBaseUrl = '/videos';
  }

  getVideos(params) {
    let _params = params;
    if (params) {
      _params = concatParams(this.config, this.secretKey)(params);
    }
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/list?${_params}`)
      .then(res => res.json())
      .then(res => getVideosLinks(res.videos))
      .catch(err => new Error('No videos to show!'));
  }

  getVideoInfo(id) {
    if (!id) {
      return new Error('You must provide an id in order to get the video information!');
    }
    let params = concatParams(this.config, this.secretKey)({videoKey: id});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/show?${params}`)
      .then(res => res.json())
      .then(res => ({...toCamelCase(res.video), videoLink: getVideoLink(res.video.key)}))
      .catch(err => new Error('No video to show'));
  }

  deleteVideo(id) {
    if (!id) {
      return new Error('You must provide an id in order to delete a video!');
    }
    let params = concatParams(this.config, this.secretKey)({videoKey: id});
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/delete?${params}`)
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
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/update?${params}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'error') {
          return {status: 'Error', message: `Video with the key ${id} does not exist`};
        }
        return this.getVideoInfo(id);
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
    return fetch(`${this.baseUrl}${this.videosBaseUrl}/create?${params}`)
      .then(res => res.json())
      .then(res => {
        const {key, token} = getUploadTokenAndKey(res);
        return fetch(
          `${this.uploadBaseUrl}${
            this.videosBaseUrl
          }/upload?api_format=json&key=${key}&token=${token}`,
          {
            method: 'POST',
            headers: {
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: file
          }
        )
          .then(res => res)
          .catch(err => new Error('An error occurred while trying to upload the file!'));
      })
      .catch(err => new Error(err));
  }
}

export default JWPlayerAPI;
