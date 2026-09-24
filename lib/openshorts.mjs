export function buildOpenShortsProcessPayload(url) {
  return {
    url,
    acknowledged: true,
    captions: true,
    auto_hook: true,
    target_clips: 1,
    clip_min_seconds: 15,
    clip_max_seconds: 60,
  };
}

export function parseOpenShortsResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || "Respons OpenShorts tidak valid." };
  }
}
