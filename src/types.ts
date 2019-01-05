export type Config = {
  apiKey: string,
  secretKey: string
};

export type Params = {
  api_format: string,
  api_key: string,
  api_nonce: number,
  api_timestamp: number,
  [key: string]: string|number|any
};

export type Video = {
  key: string,
  [key: string]: any|number|string,
  description: string,
  duration: number,
  date: number,
  thumbnail: string,
  title: string,
  md5: string,
  mediatype: string,
  tags: string|Array<string>,
  link: string,
  custom: any,
  author: string,
  updated: string,
  upload_session_id: string,
  expires_date: number,
  preview: string,
  video: string,
  view: number,
  sourcetype: string,
  size: number,
  status: string
};

export type VideoParams = {
  title: string,
  description?: string,
  tags?: string,
  author?: string,
  date?: number,
  size?: number,
  uploadContentType?: string,
  md5?: string,
  sourceformat?: string,
  sourceurl?: string,
  sourcetype?: string,
  link?: string,
  duration?: number
};

export type Thumbnail = {
  videoKey: string,
  position?: number
};

type PlayerAdversiting = {
  admessage: string,
  client: string,
  companiondiv: {
    height: number,
    id: string,
    width: number
  },
  cuetext: string,
  schedule: string|any,
  skipmessage: string,
  skipoffset: number,
  skiptext: string,
  tag: string,
  vpaidmode: string
};

type PlayerSkin = {
  key: string,
  name: string,
  inactive: boolean,
  background: any,
  active: boolean,
  type: string
};

export type NewPlayerInfo = {
  advertising?: PlayerAdversiting,
  advertisingScheduleKey?: string|any,
  aspectratio?: number,
  autostart?: boolean,
  captions?: string,
  currentitemtext?: string,
  cloudHostedPlayer?: string,
  custom?: any,
  displaytitle?: boolean,
  displaydescription?: string,
  feedcontainerid?: string,
  gaWebPropertyId?: string,
  height?: number,
  mute?: boolean,
  name?: string,
  nextupoffset?: number,
  nextuptext?: string,
  abouttext?: string,
  aboutlink?: string,
  includeCompatibilityScript?: boolean,
  playlist?: string|any,
  playlistlayout?: any,
  playlistsize?: number,
  playbackRateControls?: any,
  playbackRates?: any,
  preload?: string,
  defaultBandwidthEstimate?: any,
  primary?: string,
  recommendationChannelKey?: string,
  relatedAutoplaymessage?: any,
  relatedAutoplaytimer?: any,
  relatedDisplaymode?: any,
  relatedVideos?: string,
  relatedHeading?: any,
  relatedOnclick?: string,
  releaseChannel?: string,
  repeat?: string,
  responsive?: boolean,
  sharing?: string,
  sharingHeading?: any,
  sharingPlayerKey?: string,
  sitecatalyst?: boolean,
  skin?: PlayerSkin,
  stretching?: string,
  template?: any,
  version?: string,
  visualplaylist?: any,
  watermark?: any,
  width?: number,
  _key?: any,
};

export type Player = {
  views: number
  height: number,
  cloudHostedPlayer: string,
  key: string,
  skin: PlayerSkin,
  responsive: boolean,
  playlist: string|any,
  release_channel: string,
  name: string,
  custom: any,
  width: number,
  version: string
  ltas_channel: any
};

export type TokenAndKey = {
  token: string,
  key: string
};

export type BatchContent = {
  tags: string,
  title?: string,
  downloadUrl?: string,
};

type FetchUpload = {
  downloadUrl: string
};

export type PlayerParams = {
  name: string,
  version: string,
  releaseChannel : string,
  displaytitle: string,
  displaydescription: string,
  playlist: string,
  playlistlayout: string,
  Playlistsize: string,
  visualplaylist: string
};

type PlayerKey = {
  playerKey: string
};

type VideoKey = {
  videoKey: string
};
export type CustomParams = VideoParams | Thumbnail | BatchContent | FetchUpload | PlayerKey | VideoKey | PlayerParams| {};

