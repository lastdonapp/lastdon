import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
<<<<<<< HEAD
=======
import { environment } from '../../environments/environment';
>>>>>>> master


@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
<<<<<<< HEAD
  private readonly publicKey: string = 'APP_USR-1a93fe5d-511d-4244-8cca-9fa518000aed'; // Clave pública de prueba
  private readonly accessToken: string = 'APP_USR-261335938667530-090417-01bdd9feea5f4d95dcb74df66c307e69-1977951358'; // Token de acceso de prueba
=======
  private readonly publicKey: string = environment.mercadoPagoPublicKey;
  private readonly accessToken: string = environment.mercadoPagoAccessToken;
>>>>>>> master

  constructor(private http: HttpClient) {}



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