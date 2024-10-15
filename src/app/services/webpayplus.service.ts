import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebpayplusService {

  
private apiUrl = 'https://api.transbank.cl/webpayplus'; // Endpoint de la API Webpay Plus

  constructor(private http: HttpClient) { }



  // Método para iniciar la transacción con Webpay Plus
  iniciarTransaccion(monto: number, ordenCompra: string, sessionId: string, returnUrl: string): Observable<any> {
    const body = {
      commerce_code: '597055555532',  // Tu código de comercio
      api_key: '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C', // Tu API Key
      amount: monto,
      buy_order: ordenCompra,
      session_id: sessionId,
      return_url: returnUrl
    };

    return this.http.post(`${this.apiUrl}/transactions`, body);
  }

  // Método para confirmar la transacción
  confirmarTransaccion(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions/commit`, { token });
  }
}

  

  


