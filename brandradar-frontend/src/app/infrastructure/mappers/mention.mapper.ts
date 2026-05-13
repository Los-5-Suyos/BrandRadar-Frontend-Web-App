// En src/app/infrastructure/mappers/mention.mapper.ts
import { Mention } from '../../features/reputation-monitoring/domain/models/mention.entity';

export class MentionMapper {
  static fromApi(apiItem: any): Mention {
    return {
      id: apiItem.id,
      content: apiItem.content,
      sentiment: apiItem.sentimentType, // Mapeo de tu db.json [cite: 1]
      isCritical: apiItem.sentimentType === 'NEGATIVO',
      date: new Date(),
    };
  }

  static fromApiList(apiList: any[]): Mention[] {
    return apiList ? apiList.map((item) => this.fromApi(item)) : [];
  }
}
