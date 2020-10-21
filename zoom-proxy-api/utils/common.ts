import { RequestInit } from 'node-fetch';

import token from './jwt';

const utils = {
	getFetchConfig() {
		const cfg: RequestInit = {
			headers: {
				'User-Agent': 'Zoom-Jwt-Request',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token},`
			}
		};

		return cfg;
	}
};

export default utils;