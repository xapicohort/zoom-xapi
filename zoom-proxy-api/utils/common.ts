import { RequestInit } from 'node-fetch';
// import apiConfig from '../api/config.json';
const apiConfig = require("../api/config.json");
import token from './jwt';

const utils = {
	fetch: {
		getZoomCfg() {
			return {
				headers: {
					'User-Agent': 'Zoom-Jwt-Request',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token},`
				}
			};
		},
	},

	getJwtToken() {
		return token;
	},

	getApiRoot(opts: any = {}) {
		const getProxy = opts.proxy;
		const { proxy, zoom } = apiConfig;
		
		return getProxy ? proxy.root : zoom.root;
	},

	getPrimaryZoomHostId() {
		return apiConfig.zoom.primaryHostId;
	},

	getPrimaryMeetingId() {
		return apiConfig.zoom.primaryMeetingId;
	},
};

export default utils;
