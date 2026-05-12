import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageHelper {
  // Guarda el token o cualquier objeto convirtiéndolo a texto
  saveData(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Recupera los datos y los vuelve a convertir en objeto TypeScript
  getData<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  // Borra la sesión (útil para el Logout)
  clear(): void {
    localStorage.clear();
  }
}
