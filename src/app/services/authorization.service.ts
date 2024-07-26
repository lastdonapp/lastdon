import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private clientId = '522125817708180';
  private redirectUri = 'https://misprueba.com';
  private codeChallenge = 'k0_3PvfpVm6MAdeTlSnzUGlJheHIp6CPS0Uq-ZFjqDY';
  private codeChallengeMethod = 'S256';

  constructor() {}

  generateAuthorizationUrl(): string {
    const baseUrl = 'https://auth.mercadolibre.com/authorization';
    return `${baseUrl}?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&code_challenge=${this.codeChallenge}&code_challenge_method=${this.codeChallengeMethod}`;
  }
}
