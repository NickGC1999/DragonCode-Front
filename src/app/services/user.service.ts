import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface UserProfile {
  nombre: string;
  apellido: string;
  correo: string;
  joinDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Estado inicial del usuario
  private readonly initialState: UserProfile = {
    nombre: 'Dragon',
    apellido: 'Coder',
    correo: 'draco@dragoncode.com',
    joinDate: '2026'
  };

  // BehaviorSubject almacena el estado actual y lo emite a los nuevos suscriptores
  private userProfileSubject = new BehaviorSubject<UserProfile>(this.initialState);

  constructor() {}

  /**
   * Obtiene el Observable del perfil del usuario para consumirlo reactivamente
   */
  getProfile(): Observable<UserProfile> {
    return this.userProfileSubject.asObservable();
  }

  /**
   * Obtiene el valor actual síncrono del perfil (útil para lecturas puntuales)
   */
  getCurrentProfile(): UserProfile {
    return this.userProfileSubject.getValue();
  }

  /**
   * Simula una actualización en el backend y luego actualiza el estado local
   * @param newData Datos parciales a actualizar
   */
  updateProfile(newData: Partial<UserProfile>): Observable<UserProfile> {
    const currentData = this.userProfileSubject.getValue();
    const updatedData = { ...currentData, ...newData };

    // Simulamos latencia de red de 1 segundo (Petición HTTP simulada)
    return of(updatedData).pipe(
      delay(1000),
      tap(data => {
        // Al completarse la "petición HTTP", actualizamos la fuente de la verdad
        this.userProfileSubject.next(data);
      })
    );
  }
}
