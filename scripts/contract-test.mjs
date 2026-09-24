import assert from 'node:assert/strict';
import { buildOpenShortsProcessPayload, parseOpenShortsResponse } from '../lib/openshorts.mjs';

const url = 'https://example.com/test-video.mp4';
const payload = buildOpenShortsProcessPayload(url);

assert.deepEqual(payload, {
  url,
  acknowledged: true,
  captions: true,
  auto_hook: true,
  target_clips: 1,
  clip_min_seconds: 15,
  clip_max_seconds: 60,
});

const accepted = parseOpenShortsResponse('{"job_id":"job_test_123","status":"queued"}');
assert.equal(accepted.job_id, 'job_test_123');
assert.equal(accepted.status, 'queued');

const completed = parseOpenShortsResponse(JSON.stringify({
  status: 'completed',
  result: {
    clips: [{ index: 0, title: 'Test Clip', video_url: 'https://cdn.example/clip.mp4', download_url: 'https://cdn.example/clip.mp4' }]
  }
}));
assert.equal(completed.status, 'completed');
assert.equal(completed.result.clips.length, 1);
assert.ok(completed.result.clips[0].download_url.startsWith('https://'));

const invalid = parseOpenShortsResponse('upstream error');
assert.equal(invalid.error, 'upstream error');

console.log('PASS: OpenShorts request/response contract checks');
