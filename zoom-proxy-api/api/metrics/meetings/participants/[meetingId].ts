import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';
import utils from '../../../../utils/common';
import { errorHandler } from '../../../custom/error-handler';

// NOTE: real route would be .../{meetingId}/participants

export default async (req: NowRequest, res: NowResponse) => {
	const { method, query = {} as any } = req;

	if (method != 'GET') {
		errorHandler.sendError(res, 'Request must be GET', 400);
		return;
	}

	const apiRoot = utils.getApiRoot();
	const fallbackMeetingId = utils.getPrimaryMeetingId();

	const { meetingId } = query;

	// https://marketplace.zoom.us/docs/api-reference/zoom-api/dashboards/dashboardmeetingparticipants

	let zoomApiEndpoint = `${apiRoot}/metrics/meetings/${meetingId || fallbackMeetingId}/participants`;

	if (query.type) {
		zoomApiEndpoint += '?' + new URLSearchParams(query);
	}

	const cfg = utils.fetch.getZoomCfg();

	try {
		const zoomResponse = await fetch(zoomApiEndpoint, cfg);

		const { ok, status, statusText } = zoomResponse;

		if (ok) {
			const json = await zoomResponse.json();

			res.json(json);
		} else {
			console.error('Error:', status, statusText);
			res.status(status).send(statusText);
		}

	} catch (error) {
		console.error('error:', error);
		res.status(400).send(error);
	}
}