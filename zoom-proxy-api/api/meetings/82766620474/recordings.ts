import { NowRequest, NowResponse } from '@vercel/node'
import fetch from 'node-fetch';
import utils from '../../../utils/common';


// recurring #team-zoom meeting
const meetingId = 82766620474;

export default async (req: NowRequest, res: NowResponse) => {
  // const { body, query, cookies } = req;

  const zoomApiEndpoint = `https://api.zoom.us/v2/meetings/${meetingId}/recordings`;

	const cfg = utils.getFetchConfig();

  try {
    // https://github.com/node-fetch/node-fetch
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




  // res.json({ body, query, cookies });
}




// Example 
// https://marketplace.zoom.us/docs/api-reference/zoom-api/cloud-recording/recordingget
// https://api.zoom.us/v2/meetings/{meetingId}/recordings

/*
{
  "account_id": "DSmWaLh2Rrm9_cMJ5EdRLQ",
  "duration": 44,
  "host_email": "mkliewer@torrancelearning.com",
  "host_id": "JPYZGbjgQg6eIR2WhWMyPw",
  "id": 82766620474,
  "recording_count": 5,
  "recording_files": [
    {
      "download_url": "https://torrancelearning.zoom.us/rec/download/dIVEy59Ai3EBaQEGOSrFXCk9Ssk7jSmPYsjHDIEXgppRPZrd5z8IOS803q_r_kNP_LpjOGMwxrC21Nwf.ghDCIpXOODJIXdrp",
      "file_size": 236412740,
      "file_type": "MP4",
      "id": "ddc80928-dfdf-4602-bafb-2f7208643681",
      "meeting_id": "G9kkuWLyS260vDFGQpFFPA==",
      "play_url": "https://torrancelearning.zoom.us/rec/play/dIVEy59Ai3EBaQEGOSrFXCk9Ssk7jSmPYsjHDIEXgppRPZrd5z8IOS803q_r_kNP_LpjOGMwxrC21Nwf.ghDCIpXOODJIXdrp",
      "recording_end": "2020-09-30T19:15:42Z",
      "recording_start": "2020-09-30T18:30:47Z",
      "recording_type": "shared_screen_with_speaker_view",
      "status": "completed"
    },
    {
      "download_url": "https://torrancelearning.zoom.us/rec/download/XpinLSqGVu2bldcw46XrdPnK8wKZG02qqDQUAAkOLEQ7d-Dxp58aUz8ZoFSPDFtLnK5_OKAPhzYzZ46b.0zSbZ8l_jdl7_7jx",
      "file_size": 18345193,
      "file_type": "M4A",
      "id": "ace0d804-09f7-4459-9fbe-950539074e53",
      "meeting_id": "G9kkuWLyS260vDFGQpFFPA==",
      "play_url": "https://torrancelearning.zoom.us/rec/play/XpinLSqGVu2bldcw46XrdPnK8wKZG02qqDQUAAkOLEQ7d-Dxp58aUz8ZoFSPDFtLnK5_OKAPhzYzZ46b.0zSbZ8l_jdl7_7jx",
      "recording_end": "2020-09-30T19:15:42Z",
      "recording_start": "2020-09-30T18:30:47Z",
      "recording_type": "audio_only",
      "status": "completed"
    },
    {
      "download_url": "https://torrancelearning.zoom.us/rec/download/bde82f40-5ee8-44e3-94c4-6a0102090b84",
      "file_type": "TIMELINE",
      "meeting_id": "G9kkuWLyS260vDFGQpFFPA==",
      "recording_end": "2020-09-30T19:15:42Z",
      "recording_start": "2020-09-30T18:30:47Z"
    },
    {
      "download_url": "https://torrancelearning.zoom.us/rec/download/pzOJRdIitC-CMX_Rhu1uFlM2sDLJ-N7Fud_F5jUZeOX3CDEYqkllx2E3XDX-gDl93uXOD9161RgYTV3s.nJ-dnaievDshKEhE",
      "file_size": 54236,
      "file_type": "TRANSCRIPT",
      "id": "44d7488c-1fae-44ce-9d81-c2cef9551782",
      "meeting_id": "G9kkuWLyS260vDFGQpFFPA==",
      "play_url": "https://torrancelearning.zoom.us/rec/play/pzOJRdIitC-CMX_Rhu1uFlM2sDLJ-N7Fud_F5jUZeOX3CDEYqkllx2E3XDX-gDl93uXOD9161RgYTV3s.nJ-dnaievDshKEhE",
      "recording_end": "2020-09-30T19:15:42Z",
      "recording_start": "2020-09-30T18:30:47Z",
      "recording_type": "audio_transcript",
      "status": "completed"
    },
    {
      "download_url": "https://torrancelearning.zoom.us/rec/download/42K-jO2QU4NtJwWhDuBsjncAFFdLxgoMMbKr0oXBEM2w__mP3iZSaOgPIamqsGoSNayGTV4bgsqfo1Rx.PBxnqQ4B5fHlJ9KG",
      "file_size": 165,
      "file_type": "CHAT",
      "id": "9a7cbe83-6555-4014-8164-58c4d53d41a1",
      "meeting_id": "G9kkuWLyS260vDFGQpFFPA==",
      "play_url": "https://torrancelearning.zoom.us/rec/play/42K-jO2QU4NtJwWhDuBsjncAFFdLxgoMMbKr0oXBEM2w__mP3iZSaOgPIamqsGoSNayGTV4bgsqfo1Rx.PBxnqQ4B5fHlJ9KG",
      "recording_end": "2020-09-30T19:15:42Z",
      "recording_start": "2020-09-30T18:30:47Z",
      "recording_type": "chat_file",
      "status": "completed"
    }
  ],
  "share_url": "https://torrancelearning.zoom.us/rec/share/4WnLWbzIqeMhatvd93f5q9NnE7stmlTAdRzcPtt6r1fVumsPivtbQdsqb1EpTBHE.qYQoS7jylGyhv2EV",
  "start_time": "2020-09-30T18:30:46Z",
  "timezone": "America/New_York",
  "topic": "xAPI Cohort - Team Zoom",
  "total_size": 254812334,
  "type": 3,
  "uuid": "G9kkuWLyS260vDFGQpFFPA=="
}

*/