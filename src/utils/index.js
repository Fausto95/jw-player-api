import _ from 'lodash/fp';
import sha1 from 'crypto-js/sha1';
import utf8 from 'crypto-js/enc-utf8';
import hex from 'crypto-js/enc-hex';
import nonce from 'nonce';
import {stringify, parse} from 'query-string';
import camelCase from 'to-camel-case';
import snake_case from 'to-snake-case';

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'ContentType',
  'Access-Control-Allow-Methods': 'GET, POST'
};

const mode = 'no-cors';

const signature = (config, secret_key) => sha1(stringify(config) + secret_key).toString(hex);

const generateParams = (config, customParams) => {
  const params = {
    api_format: config.apiFormat,
    api_key: config.apiKey,
    api_nonce: nonce()(8),
    api_timestamp: Math.floor(Date.now() / 1000)
  };
  if (!customParams) {
    return `${stringify(params)}&api_signature=${signature(params, config.secretKey)}`;
  }
  return `${stringify({...params, ...customParams})}&api_signature=${signature(
    {...params, ...customParams},
    config.secretKey
  )}`;
};

const stringifyParams = params => stringify(params);
const parseParams = params => parse(params);

const formatVideoInfo = video => ({
  id: video.key,
  description: video.description || '',
  duration: video.duration,
  date: video.date,
  thumbnail: `https://content.jwplatform.com/thumbs/${video.key}.jpg`,
  title: video.title,
  mediaType: video.mediatype,
  md5: video.md5,
  tags: video.tags || [],
  link: video.link,
  custom: video.custom,
  author: video.author,
  updatedAt: video.updated,
  uploadSessionId: video.upload_session_id,
  expiresDate: video.expires_date,
  preview: `http://content.jwplatform.com/previews/${video.key}`,
  video: `https://content.jwplatform.com/players/${video.key}.html`,
  views: video.view,
  sourceType: video.sourcetype,
  size: video.size,
  status: video.status
});

const getVideoInfo = video => {
  if (_.isArray(video)) {
    return video.map(_video => formatVideoInfo(_video));
  }
  return formatVideoInfo(video);
};

const toCamelCase = config => {
  if (_.isObject(config)) {
    return _.pipe(_.toPairs, _.map(([first, second]) => [camelCase(first), second]), _.fromPairs)(
      config
    );
  }
  if (_.isArray(config)) return _.map(key => camelCase(key), config);
  if (_.isString) return camelCase(config);
  return new Error('Type of input is not valid!');
};

const toSnakeCase = config => {
  if (_.isObject(config)) {
    return _.pipe(_.toPairs, _.map(([first, second]) => [snake_case(first), second]), _.fromPairs)(
      config
    );
  }
  if (_.isArray(config)) return _.map(key => snake_case(key), config);
  if (_.isString) return snake_case(config);
  return new Error('Type of input is not valid!');
};

const concatParams = (config, secretKey) => customParams => {
  return _.pipe(conf => parseParams(conf), _.omit('api_signature'), conf =>
    generateParams(toCamelCase({...conf, secretKey}), toSnakeCase(customParams))
  )(config);
};

const getUploadTokenAndKey = body => ({
  token: _.get('link.query.token', body),
  key: _.get('link.query.key', body)
});

const getThumbnailUploadParams = async (config, secretKey, videoKey, request) => {
  let params = concatParams(config, secretKey)({videoKey});
  const {thumbnail: {status}} = await (await request(
    `https://api.jwplatform.com/v1/videos/thumbnails/show?${params}`,
    {headers}
  )).json();
  if (status === 'ready') {
    params = concatParams(config, secretKey)({videoKey});
    const response = await (await request(
      `https://api.jwplatform.com/v1/videos/thumbnails/update?${params}`
    )).json();
    return getUploadTokenAndKey(response);
  }
  return new Error('Unaible to upload this thumbnail');
};

const formatPlayerInfo = player => ({
  advertising: player.advertising,
  advertising_schedule_key: player.advertising_schedule_key,
  aspectratio: player.aspectratio,
  autostart: player.autostart,
  captions: player.captions,
  current_item_text: player.currentitemtext,
  cloudHostedPlayer: `https://content.jwplatform.com/libraries/${player.key}.js`,
  custom: player.custom,
  display_title: player.displaytitle,
  display_description: player.displaydescription,
  feed_container_id: player.feedcontainerid,
  ga_web_property_id: player.ga_web_property_id,
  height: player.height,
  mute: player.mute,
  name: player.name,
  next_up_offset: player.nextupoffset,
  next_up_text: player.nextuptext,
  about_text: player.abouttext,
  about_link: player.aboutlink,
  include_compatibility_script: player.include_compatibility_script,
  playlist: player.playlist,
  playlist_layout: player.playlistlayout,
  playlist_size: player.playlistsize,
  playback_rate_controls: player.playback_rate_controls,
  playback_rates: player.playback_rates,
  preload: player.preload,
  default_bandwidth_estimate: player.default_bandwidth_estimate,
  primary: player.primary,
  recommendations_channel_key: player.recommendations_channel_key,
  related_autoplaymessage: player.related_autoplaymessage,
  related_autoplaytimer: player.related_autoplaytimer,
  related_displaymode: player.related_displaymode,
  related_videos: player.related_videos,
  related_heading: player.related_heading,
  related_onclick: player.related_onclick,
  release_channel: player.release_channel,
  repeat: player.repeat,
  responsive: player.responsive,
  sharing: player.sharing,
  sharing_heading: player.sharing_heading,
  sharing_player_key: player.sharing_player_key,
  sharing_sites: player.sharing,
  site_catalyst: player.sitecatalyst,
  skin: player.skin,
  stretching: player.stretching,
  template: player.template,
  version: player.version,
  visual_playlist: player.visualplaylist,
  watermark: player.watermark,
  width: player.width,
  _key: player._key
});

const getPlayerInfo = player => {
  if (_.isArray(player)) {
    return player.map(p =>
      toCamelCase({
        views: p.views,
        height: p.height,
        cloudHostedPlayer: `https://content.jwplatform.com/libraries/${p.key}.js`,
        key: p.key,
        skin: p.skin,
        responsive: p.responsive,
        playlist: p.playlist,
        release_channel: p.release_channel,
        name: p.name,
        custom: p.custom,
        width: p.width,
        version: p.version,
        ltas_channel: p.ltas_channel
      })
    );
  }
  return toCamelCase(formatPlayerInfo(player));
};

export {
  headers,
  mode,
  generateParams,
  stringifyParams,
  parseParams,
  signature,
  getVideoInfo,
  concatParams,
  getUploadTokenAndKey,
  getThumbnailUploadParams,
  getPlayerInfo
};
