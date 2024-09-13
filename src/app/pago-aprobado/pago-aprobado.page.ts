
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-pago-aprobado',
  templateUrl: './pago-aprobado.page.html',
  styleUrls: ['./pago-aprobado.page.scss'],
})
export class PagoAprobadoPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private toastController: ToastController,
    private router: Router
  ) { }

 
  goBack() {
    this.router.navigate(['/menu']);
  }



  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const pedidoId = params['pedidoId'];
      const paymentStatus = params['collection_status'];
  
      // Verificar que estamos recibiendo los valores esperados
      console.log('Pedido ID:', pedidoId);
      console.log('Estado del pago:', paymentStatus);
  
      if (pedidoId && paymentStatus === 'approved') {
        try {
          await this.supabaseService.pagarPedido(pedidoId);
          console.log('Pedido actualizado correctamente');
        } catch (error) {
          console.error('Error al actualizar el pedido:', error);
        }
      } else {
        console.error('Pago no aprobado o pedidoId faltante.');
      }
    });
  }



 

}