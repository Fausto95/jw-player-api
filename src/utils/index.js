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
  video: `https://content.jwplatform.com/players/${video.key}.html`,
  updatedAt: video.updated,
  uploadSessionId: video.upload_session_id,
  expiresDate: video.expires_date,
  views: video.view,
  sourceType: video.sourcetype,
  size: video.size,
  status: video.status
});

const getVideoInfo = _video => {
  if (_.isArray(_video)) {
    return _video.map(video => formatVideoInfo(video));
  }
  return formatVideoInfo(_video);
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

export {
  headers,
  mode,
  generateParams,
  stringifyParams,
  parseParams,
  signature,
  getVideoInfo,
  concatParams,
  getUploadTokenAndKey
};
