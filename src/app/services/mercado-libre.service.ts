import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api.example.com/oauth/token'; // Reemplaza con la URL de tu API
  private clientId = 'your-client-id'; // Reemplaza con tu client_id
  private clientSecret = 'your-client-secret'; // Reemplaza con tu client_secret
  private audience = 'your-audience'; // Reemplaza con el valor adecuado para el audience

  constructor(private http: HttpClient) {}

  private getAuthHeader(): string {
    const credentials = `${this.clientId}:${this.clientSecret}`;
    return `Basic ${btoa(credentials)}`;
  }

  public getToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.getAuthHeader()
    });

    const body = {
      audience: this.audience,
      grant_type: 'client_credentials'
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      catchError((error) => {
        console.error('Error al obtener el token:', error);
        throw error;
      })
    );
  }
}
