import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHttpClient } from '@angular/common/http';
import { BACK_END_BASE_URL } from './constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'fr-CA' },
    { provide: BACK_END_BASE_URL, useValue: 'https://tm-server-alpha-25st4ix4ra-nn.a.run.app' },
  ],
};
