// En src/app/infrastructure/mappers/mention.mapper.ts
import { Mention } from './mention.entity';

export class MentionMapper {
  static fromApi(apiItem: any): Mention {
    return {
      id: apiItem.id,
      content: apiItem.content,
      sentiment: apiItem.sentimentType, // Mapeo de tu db.json [cite: 1]
      isCritical: apiItem.sentimentType === 'NEGATIVO',
      date: new Date(apiItem.date ?? apiItem.timestamp ?? Date.now()),
      // Optional dashboard fields
      brandId: apiItem.brandId ?? null,
      source: apiItem.source ?? null,
      timestamp: apiItem.timestamp ? new Date(apiItem.timestamp) : new Date(),
      authorHandle: apiItem.authorHandle ?? apiItem.author ?? null,
    };
  }

  static fromApiList(apiList: any[]): Mention[] {
    return apiList ? apiList.map((item) => this.fromApi(item)) : [];
  }
}
