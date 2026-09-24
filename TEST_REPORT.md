# TokoClip Test Report

Date: 2026-09-24

## Passed in this environment

- OpenShorts request payload contract test: PASS
- OpenShorts completed-response parsing contract test: PASS
- Invalid upstream response handling: PASS
- Server-side API key usage path: PASS (source inspection)
- Real key absent from distributable source/ZIP: PASS
- Health endpoint added: `/api/health`

## Not executed here

A live authenticated request to `https://api.openshorts.app` could not be executed because this build runtime has no outbound DNS/network access to that host. Therefore this package does **not** claim a live end-to-end generation pass from this environment.

For a true production E2E pass, deploy to Vercel (or run locally on a machine with Internet access), set `OPENSHORTS_API_KEY`, submit one rights-cleared video URL, and verify the job reaches `completed` with at least one downloadable clip.
