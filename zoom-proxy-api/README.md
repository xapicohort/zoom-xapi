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

// Paths
/meetings/82766620474/recordings
/users/JPYZGbjgQg6eIR2WhWMyPw/recordings

```
---

### Get Last Recording
#### Prod
- https://zoom-proxy-api.vercel.app/api/meetings/82766620474/recordings

#### Dev
- http://localhost:3000/api/meetings/82766620474/recordings

### Get All Recordings for User
#### Prod
- https://zoom-proxy-api.vercel.app/api/users/JPYZGbjgQg6eIR2WhWMyPw/recordings

#### Dev
- http://localhost:3000/api/users/JPYZGbjgQg6eIR2WhWMyPw/recordings

---

## Vercel
- https://vercel.com/docs/serverless-functions/introduction
- https://vercel.com/docs/serverless-functions/supported-languages#node.js
- https://vercel.com/docs/runtimes#official-runtimes/node-js

## Packages
- https://github.com/node-fetch/node-fetch
- https://github.com/auth0/node-jsonwebtoken
  - https://marketplace.zoom.us/docs/guides/auth/jwt
  - Zoom APIs and SDKs use HMAC SHA256 (HS256)