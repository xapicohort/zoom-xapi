import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';
import utils from '../../utils/common';

import webvtt from 'node-webvtt';

const vttTest = {
	async init() {
		console.log('============================\n');

		const rawRecordingData = await this.getRecordingData();
		const rawVttText = await this.getVttData(rawRecordingData);
		const rawVttJson = this.parseVttText(rawVttText);
		const processed = this.processVttJson(rawVttJson);

		return this.outputHtml(rawRecordingData, rawVttText, rawVttJson, processed);
	},

	async getRecordingData(): Promise<any> {
		const apiRoot = utils.getApiRoot({ proxy: true });
		const hostId = utils.getPrimaryZoomHostId();

		const userRecordingsEndpoint = `${apiRoot}/users/${hostId}/recordings`;

		const response = await fetch(userRecordingsEndpoint);
		return await response.json();
	},

	async getVttData(rawRecordingData: any): Promise<any> {
		const { meetings = [] } = rawRecordingData;
				
		const lastMeeting = meetings.filter((meet: any) => {
			const { recording_files = [] } = meet;

			const transcriptData = recording_files.find((data: any) => {
				return data.file_type === 'TRANSCRIPT';
			});
	
			return transcriptData;
		})[0];

		if (!lastMeeting) {
			console.error('no meetings found');
			return;
		}
		
		const {
			topic,
			start_time,
			duration,
			share_url,
			recording_files = [],
		} = lastMeeting;
		
		const transcriptData = recording_files.find((data: any) => {
			return data.file_type === 'TRANSCRIPT';
		});

		const { download_url = '' } = transcriptData;
		
		if (!download_url) {
			console.error('no download_url found');
			return;
		}
		
		const access_token = utils.getJwtToken();
		const urlWithToken = download_url + '?access_token=' + access_token;

		const response = await fetch(urlWithToken);
		return await response.text();
	},

	parseVttText(rawVttData: any) {
		if (!rawVttData) {
			return 'No VTT data.'
		}

		return webvtt.parse(rawVttData);
	},

	cleanUserData(cues: any[]): any[] {
		const userRegex = /^(.*?):/g;

		return cues.map((cue: any) => {
			const { start, end, text: rawText } = cue;

			// const duration = +(end - start).toFixed(3); // in seconds
			const duration = end - start; // in seconds

			const foundMatch = userRegex.test(rawText);

			let username = 'Unknown User';
			let usertext = rawText;

			if (foundMatch) {
				const userMatch = rawText.match(userRegex) || [];
				username = userMatch[0] || username;

				username = username.replace(':', '').trim();
				usertext = usertext.replace(userMatch, '').trim();
			} else {
				console.log('No user found for cue:', usertext);
			}

			return {
				start, end,
				duration,
				username,
				text: usertext,
			};

		});
	},

	processVttJson(rawVttJson: any) {
		const { cues = [] } = rawVttJson;

		const cleanedData = this.cleanUserData(cues);

		const userMap = new Map();

		cleanedData.forEach((cue: any) => {
			const { start, end, duration, username, text } = cue;

			const userdata = userMap.get(username) || {
				totalDuration: 0,
				cues: []
			};

			userdata.totalDuration += duration;

			userdata.cues.push({
				start, end,
				duration,
				text
			});

			userMap.set(username, userdata);
		});

		userMap.forEach((userdata: any) => {
			userdata.totalDuration = userdata.totalDuration.toFixed(3);
		});

		return { users: [...userMap] };
	},

	outputHtml(recordings: any, vttText: any, vttJson: any, processed: any) {
		return `
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
					padding: 3em;
				}


			</style>

			<h1>VTT Test</h1>
			<details>
				<summary>Raw Zoom API Data</summary>
				<pre><code>${JSON.stringify(recordings, null, 2)}</code></pre>
			</details>

			<details>
				<summary>VTT Text</summary>
				<p>${vttText ? vttText.replace(/\r/g, '<br>') : ''}</p>
			</details>

			<details>
				<summary>VTT JSON</summary>
				<pre><code>${JSON.stringify(vttJson, null, 2)}</code></pre>
			</details>

			<details>
				<summary>VTT Processed</summary>
				<pre><code>${JSON.stringify(processed, null, 2)}</code></pre>
			</details>
		`;

	}
};

export default async (req: NowRequest, res: NowResponse) => {
	const html = await vttTest.init();
	res.status(200).send(html);

}