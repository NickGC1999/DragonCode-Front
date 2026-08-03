import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notification.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  
  // Clonar la petición y agregar la URL base del entorno
  // Asumimos que req.url empieza con '/' o la apiUrl no termina en '/', ajustamos para evitar dobles slashes.
  const isAbsoluteUrl = req.url.startsWith('http');
  const baseUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
  
  const apiReq = isAbsoluteUrl ? req : req.clone({
    url: `${baseUrl}${path}`
  });

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ocurrió un error inesperado de red';
      
      if (error.error && typeof error.error === 'object' && error.error.detail) {
        // En FastAPI el formato por defecto de error es { "detail": "Mensaje" }
        errorMsg = error.error.detail;
      } else if (error.message) {
        errorMsg = error.message;
      }

      notificationService.show(errorMsg, 'error');
      
      return throwError(() => error);
    })
  );
};
