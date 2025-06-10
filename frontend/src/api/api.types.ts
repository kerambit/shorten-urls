export type UrlInfo = {
  originalUrl: string;
  createdAt: Date;
  clickCount: number;
};

export type AnalyticsInfo = {
  clickCount: number;
  lastIps: string[];
};
