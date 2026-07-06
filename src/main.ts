import 'zone.js';
// El HttpClient está configurado con withFetch() (necesario para SSR), pero zone.js
// NO parchea el fetch nativo por defecto: las respuestas HTTP llegan "fuera" de la
// zona de Angular y la UI no se repinta hasta que algo más (p.ej. un click) dispara
// una detección de cambios. Esto es lo que causaba que Dashboard, Menciones,
// Incidentes y Configuración se quedaran en blanco al recargar, y que el botón
// "Actualizar" se quedara girando hasta hacer click en otro lado.
import 'zone.js/plugins/zone-patch-fetch';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
