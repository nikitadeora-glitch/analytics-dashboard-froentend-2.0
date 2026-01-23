const UTM_STORAGE_KEY = "app_utms_v1";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

function readUtmsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const utms = {};

  let hasAny = false;
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    utms[key] = val ? val : null;
    if (val) hasAny = true;
  }

  return { utms, hasAny };
}

export function initUtmCaptureOnce() {
  try {
    const already = localStorage.getItem(UTM_STORAGE_KEY);
    if (already) return; // saved once, never overwrite

    const { utms, hasAny } = readUtmsFromUrl();
    if (!hasAny) return; // nothing to save

    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
  } catch {
    // ignore storage errors (private mode / blocked)
  }
}

export function getStoredUtms() {
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    const out = {};
    for (const key of UTM_KEYS) {
      out[key] = parsed?.[key] ?? null;
    }
    return out;
  } catch {
    // fallback: always return nulls
    return Object.fromEntries(UTM_KEYS.map(k => [k, null]));
  }
}
