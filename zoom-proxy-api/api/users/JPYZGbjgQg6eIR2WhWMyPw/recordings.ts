import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';
import utils from '../../../utils/common';

// Matt K. host ID
const userId = 'JPYZGbjgQg6eIR2WhWMyPw';
// recurring #team-zoom meeting
const meetingId = 82766620474;

const query = {
	from: '2020-09-01',
};

function postProcessData(json: any) {
	const { meetings = [] } = json || {};
	
	const filteredMeetings = meetings.filter((recording: any) => {
		return recording.id === meetingId;
	});

	const output = Object.assign({}, json);

	// override returned values with filtered data
	output.total_records = filteredMeetings.length;
	output.meetings = filteredMeetings;

	return output;
}

export default async (req: NowRequest, res: NowResponse) => {
  // const { body, query, cookies } = req;

  let zoomApiEndpoint = `https://api.zoom.us/v2/users/${userId}/recordings?`;

	zoomApiEndpoint += new URLSearchParams(query);

	const cfg = utils.getFetchConfig();

	try {
    // https://github.com/node-fetch/node-fetch
    const zoomResponse = await fetch(zoomApiEndpoint, cfg);

    const { ok, status, statusText } = zoomResponse;

    if (ok) {
			const json = await zoomResponse.json();
			
			const output = postProcessData(json);

      res.json(output);
    } else {
      console.error('Error:', status, statusText);
      res.status(status).send(statusText);
    }

  } catch (error) {
    console.error('error:', error);
    res.status(400).send(error);
  }

};




// Example 
// https://marketplace.zoom.us/docs/api-reference/zoom-api/cloud-recording/recordingslist
// https://api.zoom.us/v2/users/{userId}/recordings

/*
{
  "from": "2019-08-15",
  "to": "2019-09-15",
  "page_count": 1,
  "page_size": 30,
  "total_records": 1,
  "next_page_token": "",
  "meetings": [
    {
      "uuid": "gkABCDEnCkPuA==",
      "id": 1000000000000,
      "account_id": "AbcjxkfhdEEE",
      "host_id": "z8dfkgABBBBBBBfp8uQ",
      "topic": "MyTestPollMeeting",
      "type": 2,
      "start_time": "2019-08-29T21:54:49Z",
      "timezone": "America/Los_Angeles",
      "duration": 1,
      "total_size": 47383,
      "recording_count": 1,
      "share_url": "https://api.zoom.us/recording/share/IABCDJDKDJEEEEEk_GwfdggdgkTziMw",
      "recording_files": [
        {
          "id": "589ABBBBB-8718e",
          "meeting_id": "gkABCDEnCkPuA==",
          "recording_start": "2019-08-29T21:54:55Z",
          "recording_end": "2019-08-29T21:55:24Z",
          "file_type": "M4A",
          "file_size": 10098,
          "play_url": "https://api.zoom.us/recording/play/pfA2AvvvvvAnAzOibbbbELxl",
          "download_url": "https://api.zoom.us/recording/download/pfA2AvvvvvAnAzOibbbbELxl",
          "status": "completed",
          "recording_type": "audio_only"
        },
        {
          "meeting_id": "gkABCDEnCkPuA==",
          "recording_start": "2019-08-29T21:54:55Z",
          "recording_end": "2019-08-29T21:55:24Z",
          "file_type": "TIMELINE",
          "download_url": "https://api.zoom.us/recording/download/cc33ekldfdjfhf3-aaaaa"
        },
        {
          "id": "96119b=kdfhf791",
          "meeting_id": "gkABCDEnCkPuA==",
          "recording_start": "2019-08-29T21:54:55Z",
          "recording_end": "2019-08-29T21:55:24Z",
          "file_type": "MP4",
          "file_size": 37285,
          "play_url": "https://api.zoom.us/recording/play/abcdkjfhdhfdhfj",
          "download_url": "https://api.zoom.us/recording/download/abcdkjfhdhfdhfj",
          "status": "completed",
          "recording_type": "shared_screen_with_speaker_view"
        }
      ]
    }
  ]
}

*/