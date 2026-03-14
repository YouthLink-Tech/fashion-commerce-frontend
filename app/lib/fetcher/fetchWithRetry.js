const RETRYABLE_STATUS = [502, 503, 504];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function fetchWithRetry(
  url,
  options = {},
  retries = 5,
  delay = 1000,
) {
  try {
    const res = await fetch(url, options);

    if (RETRYABLE_STATUS.includes(res.status) && retries > 0) {
      console.warn(
        `FetchRetry: ${res.status} from ${url}. Retrying... (${retries} left)`,
      );

      await sleep(delay);

      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    return res;
  } catch (error) {
    if (retries === 0) throw error;

    console.warn(
      `FetchRetry: network error calling ${url}. Retrying... (${retries} left)`,
    );

    await sleep(delay);

    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
}
