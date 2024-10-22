import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable , throwError } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private readonly publicKey: string = environment.mercadoPagoPublicKey;
  private readonly accessToken: string = environment.mercadoPagoAccessToken;

  constructor(private readonly http: HttpClient) {}



  createPreference(items: any[], pedidoId: string): Observable<any> {
    const url = `https://api.mercadopago.com/checkout/preferences?access_token=${this.accessToken}`;
    return this.http.post(url, {
      items: items,
      back_urls: {
        success: `http://localhost:8100/pago-aprobado?pedidoId=${pedidoId}`,
        failure: `http://localhost:8100/pago-fallido?pedidoId=${pedidoId}`,
        pending: `http://localhost:8100/pago-pendiente?pedidoId=${pedidoId}`
      }
    }).pipe(
      catchError((error) => {
        console.error('Error al crear la preferencia:', error);
        return throwError(() => error);
      })
    );
  }


}