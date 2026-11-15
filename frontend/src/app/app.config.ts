import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { authInterceptor } from './interceptors/auth-interceptor';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideMonacoEditor(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
imports: [FormsModule, MonacoEditorModule.forRoot()];
