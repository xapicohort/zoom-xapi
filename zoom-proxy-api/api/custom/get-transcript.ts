import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';
import utils from '../../utils/common';
import { errorHandler } from './error-handler';

async function getVttData(zoomData: any): Promise<any> {
	const access_token = utils.getJwtToken();

	const { recording_files = [] } = zoomData;

	const transcriptData = recording_files.find((data: any) => {
		return data.file_type === 'TRANSCRIPT';
	});

	const { download_url = '' } = transcriptData;

	if (!download_url) {
		console.error('no download_url found');
		return;
	}

	const urlWithToken = download_url + '?access_token=' + access_token;

	const response = await fetch(urlWithToken);
	return await response.text();
}

export default async (req: NowRequest, res: NowResponse) => {
	const { method, body: zoomData } = req;

	if (method != 'POST') {
		errorHandler.sendError(res, 'Request must be POST and include body', 400);
		return;
	}

	if (!zoomData) {
		errorHandler.sendError(res, 'No body included', 400);
		return;
	}

	const rawVttText = await getVttData(zoomData);

	if (!rawVttText) {
		errorHandler.sendError(res, 'Unknown error getting VTT text', 400);
		return;
	}

	res.status(200).send(rawVttText);

}