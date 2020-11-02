import { NowResponse } from '@vercel/node';

export const errorHandler = {
	sendError(res: NowResponse, statusText: string, statusCode = 400) {
		console.error('Error:', statusText);
		res.status(statusCode).send({ statusCode, statusText });
	},

	badRequest(res: NowResponse, statusText = 'Bad request') {
		this.sendError(res, statusText, 400);
	},

	badCredentials(res: NowResponse, statusText = 'Invalid credentials') {
		this.sendError(res, statusText, 401);
	},

};