export interface Mention {
  id: string;
  content: string;
  sentiment: string;
  isCritical: boolean;
  date: Date;
  // Fields used by dashboard template
  brandId?: string;
  source?: string;
  timestamp?: Date;
  authorHandle?: string;
}
