import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class MercadoLibreService {
  private clientId = '522125817708180';
  private clientSecret = 'DUGcxegFSocnuLhoyb41qbf2W3T6TnS3';
  private redirectUri = 'https://misprueba.com';

  constructor(private http: HttpClient, private supabaseService: SupabaseService) {}

  exchangeCodeForToken(code: string, codeVerifier: string): Observable<any> {
    const url = 'https://api.mercadolibre.com/oauth/token';
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    });
    const data = `grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}&code=${code}&redirect_uri=${this.redirectUri}&code_verifier=${codeVerifier}`;

    return this.http.post(url, data, { headers });
  }

  refreshAccessToken(refreshToken: string): Observable<any> {
    const url = 'https://api.mercadolibre.com/oauth/token';
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    });
    const data = `grant_type=refresh_token&client_id=${this.clientId}&client_secret=${this.clientSecret}&refresh_token=${refreshToken}`;

    return this.http.post(url, data, { headers });
  }
}
