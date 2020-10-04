// https://marketplace.zoom.us/docs/guides/auth/jwt
// https://github.com/auth0/node-jsonwebtoken

import jwt from 'jsonwebtoken';

const {
	ZOOM_JWT_API_KEY,
	ZOOM_JWT_API_SECRET
} = process.env;

const header = {
	alg: "HS256",
	typ: "JWT"
};

const payload = {
	iss: ZOOM_JWT_API_KEY,
	exp: Date.now() + 3000,
};

const token = jwt.sign(payload, ZOOM_JWT_API_SECRET, { header });

export default token;
