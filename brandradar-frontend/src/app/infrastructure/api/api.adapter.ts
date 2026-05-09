import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export class ApiAdapter {
  static handleGlobalError(error: HttpErrorResponse) {
    let message = 'Error inesperado en BrandRadar';

    if (error.status === 0) message = 'No hay conexión con el servidor (db.json)';
    if (error.status === 401) message = 'Sesión expirada o Workspace bloqueado';

    console.error(`[Global Error]: ${message}`); // Esto cumple con la lógica transversal
    return throwError(() => new Error(message));
  }
}
