export type UrlInfo = {
  originalUrl: string;
  createdAt: string;
  clickCount: number;
};

export type AnalyticsInfo = {
  clickCount: number;
  lastIps: string[];
};

export type CreateResponse = {
  shortUrl: string;
  originalUrl: string;
  expiresAt: string;
};
