export interface OpenShortsProcessPayload {
  url: string;
  acknowledged: boolean;
  captions: boolean;
  auto_hook: boolean;
  target_clips: number;
  clip_min_seconds: number;
  clip_max_seconds: number;
}

export function buildOpenShortsProcessPayload(url: string): OpenShortsProcessPayload;
export function parseOpenShortsResponse(text: string): unknown;
