import type { AnalyticsInfo, UrlInfo, CreateResponse } from "./api.types";

async function fetchWithHandlingError<T>(
  fetchFn: Promise<Response>,
  defaultValue: T,
): Promise<T> {
  try {
    const response = await fetchFn;

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data for ${response.url}. Status: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return defaultValue;
  }
}

const baseUrl = "http://localhost:3000";

export async function createUrl(
  originalUrl: string,
  alias?: string,
  expiresAt?: string,
): Promise<CreateResponse> {
  const url = `${baseUrl}/shorten`;
  return await fetchWithHandlingError(
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        originalUrl,
        alias,
        expiresAt,
      }),
    }),
    {
      shortUrl: "",
      originalUrl: "",
      expiresAt: "",
    },
  );
}

export async function deleteUrl(shortUrl: string): Promise<void> {
  const url = `${baseUrl}/delete/${shortUrl}`;
  await fetchWithHandlingError(
    fetch(url, {
      method: "DELETE",
    }),
    undefined,
  );
}

export async function getInfo(shortUrl: string): Promise<UrlInfo> {
  const url = `${baseUrl}/info/${shortUrl}`;

  return await fetchWithHandlingError(fetch(url), {
    originalUrl: "",
    createdAt: "",
    clickCount: 0,
  });
}

export async function getAnalytics(shortUrl: string): Promise<AnalyticsInfo> {
  const url = `${baseUrl}/analytics/${shortUrl}`;

  return await fetchWithHandlingError(fetch(url), {
    clickCount: 0,
    lastIps: [],
  });
}
