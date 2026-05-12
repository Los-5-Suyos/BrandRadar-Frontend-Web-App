export interface Mention {
  id: string;
  content: string;
  sentiment: string;
  isCritical: boolean;
  date: Date;
  brandId: string;
  source: string;
  timestamp: string;
  authorHandle: string;
}
