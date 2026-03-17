const RETRYABLE_STATUS = [500, 502, 503, 504];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function fetchWithRetry(
  url,
  options = {},
  retries = 12,
  delay = 2500,
) {
  const { signal: _ignored, ...fetchOptions } = options;

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: AbortSignal.timeout(10000),
    });

    if (RETRYABLE_STATUS.includes(res.status) && retries > 0) {
      console.warn(
        `FetchRetry: ${res.status} from ${url}. Retrying... (${retries} left)`,
      );
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, delay);
    }

    return res;
  } catch (error) {
    if (retries === 0) throw error;

    console.warn(
      `FetchRetry: network error calling ${url}. Retrying... (${retries} left)`,
    );
    await sleep(delay);
    return fetchWithRetry(url, options, retries - 1, delay);
  }
}
