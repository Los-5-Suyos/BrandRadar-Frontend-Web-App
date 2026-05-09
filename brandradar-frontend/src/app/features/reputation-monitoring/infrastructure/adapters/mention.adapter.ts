import { Injectable } from '@angular/core';
// Salimos hasta la raíz de 'app' para buscar la infraestructura global
import { MentionMapper } from '../../../../infrastructure/mappers/mention.mapper';
// Entramos a la carpeta de modelos dentro del dominio de la feature
import { Mention } from '../../domain/models/mention.entity';

@Injectable({ providedIn: 'root' })
export class MentionAdapter {
  adaptResponse(apiData: any[]): Mention[] {
    // Usamos el Mapper global para limpiar los datos del db.json
    return MentionMapper.fromApiList(apiData);
  }
}
