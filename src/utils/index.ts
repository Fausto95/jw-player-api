import map from 'lodash/fp/map';
import isArray from 'lodash/fp/isArray';
import pipe from 'lodash/fp/pipe';
import isString from 'lodash/fp/isString';
import isObject from 'lodash/fp/isObject';
import fromPairs from 'lodash/fp/fromPairs';
import toPairs from 'lodash/fp/toPairs';
import omit from 'lodash/fp/omit';
import get from 'lodash/fp/get';
import * as crypto from 'crypto-js';
import nonce from './nonce';
import {stringify, parse} from 'query-string';
import camelCase from './camelCase';
import snake_case from './snakeCase';
import {Config, Params, CustomParams, Player, Video, TokenAndKey} from '../types';

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'ContentType',
  'Access-Control-Allow-Methods': 'GET, POST'
};

const signature = (config: Params, secret_key: string): string => crypto.SHA1(stringify(config) + secret_key).toString(crypto.enc.Hex);

const generateParams = (config: Config, customParams?: CustomParams): string => {
  const params: Params = {
    api_format: 'json',
    api_key: config.apiKey,
    api_nonce: nonce(8)(),
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

const stringifyParams = (params: Config): string => stringify(params);
const parseParams = (params: string): Config|any => parse(params);

const formatVideoInfo = (video: Video): any => toCamelCase({
  ...video,
  description: video.description || '',
  thumbnail: `https://content.jwplatform.com/thumbs/${video.key}.jpg`,
  tags: video.tags || [],
  preview: `http://content.jwplatform.com/previews/${video.key}`,
  video: `https://content.jwplatform.com/players/${video.key}.html`,
});

const getVideoInfo = (video: Video): Video|Array<Video> => {
  if (isArray(video)) {
    return map(_video => formatVideoInfo(_video), video);
  }
  return formatVideoInfo(video);
};

const toCamelCase = (obj: any): any => {
  if (isObject(obj)) {
    return pipe(toPairs, map(([first, second]) => [camelCase(first), second]), fromPairs)(
      obj
    );
  }
  if (isArray(obj)) return map(key => camelCase(key), obj);
  if (isString) return camelCase(obj);
  return new Error('Type of input is not valid!');
};

const toSnakeCase = (obj: any): any => {
  if (isObject(obj)) {
    return pipe(toPairs, map(([first, second]) => [snake_case(first), second]), fromPairs)(
      obj
    );
  }
  if (isArray(obj)) return map((key: string) => snake_case(key), obj);
  if (isString) return snake_case(obj);
  return new Error('Type of input is not valid!');
};

const concatParams = (config: string, secretKey: string) => (customParams: CustomParams): string => {
  return pipe(
    (conf: string): Config => parseParams(conf),
    omit('api_signature'),
    (conf: any): any => {
      return generateParams(toCamelCase({ ...conf, secretKey }), toSnakeCase(customParams));
    }
  )(config);
};

const getUploadTokenAndKey = (body: any): TokenAndKey => ({
  token: get('link.query.token', body),
  key: get('link.query.key', body)
});

const getThumbnailUploadParams = async (config: string, secretKey: string, videoKey: string, request: any): Promise<TokenAndKey|any> => {
  let params = concatParams(config, secretKey)({videoKey});
  const {thumbnail: {status}} = await request({
    url: `https://api.jwplatform.com/v1/videos/thumbnails/show?${params}`,
    headers,
    json: true
  });
  console.log({status});
  if (status === 'ready') {
    params = concatParams(config, secretKey)({videoKey});
    const response = await request({
      url: `https://api.jwplatform.com/v1/videos/thumbnails/update?${params}`,
      json: true,
      headers
    });
    return getUploadTokenAndKey(response);
  }
  return new Error('Unaible to upload this thumbnail');
};

const getPlayerInfo = (player: Player|Array<Player>): Player|Array<Player> => {
  if (isArray(player)) {
    return map((p: Player) =>
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
    , player);
  }
  return toCamelCase({
    ...player,
    cloudHostedPlayer: `https://content.jwplatform.com/libraries/${player.key}.js`
  })
};

export {
  headers,
  generateParams,
  stringifyParams,
  signature,
  getVideoInfo,
  concatParams,
  getUploadTokenAndKey,
  getThumbnailUploadParams,
  getPlayerInfo
};
