# xAPI Cohort Fall 2020 | Team Zoom Proxy API
https://zoom-proxy-api.vercel.app

This folder's project is a proxy API to get Zoom data via API, without exposing Zoom credentials in a live editing environment where data is shared.

This proxy API is deployed on [Vercel](https://vercel.com).

## Recurring Meeting ID
`82766620474`

```
// Zoom API
https://api.zoom.us/v2

// Proxy API
https://zoom-proxy-api.vercel.app/api

// Path
/meetings/82766620474/recordings

// Final proxy path
https://zoom-proxy-api.vercel.app/api/meetings/82766620474/recordings
```

## Vercel
- https://vercel.com/docs/serverless-functions/introduction
- https://vercel.com/docs/serverless-functions/supported-languages#node.js
- https://vercel.com/docs/runtimes#official-runtimes/node-js

## Packages
- https://github.com/node-fetch/node-fetch
- https://github.com/auth0/node-jsonwebtoken
  - https://marketplace.zoom.us/docs/guides/auth/jwt
  - Zoom APIs and SDKs use HMAC SHA256 (HS256)