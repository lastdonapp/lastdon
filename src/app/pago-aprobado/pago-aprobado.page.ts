
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

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      const pedidoId = params['pedidoId'];
      const paymentStatus = params['collection_status']; // Verifica el estado del pago
      const usuario = 'correoUsuario@example.com'; // Pasa el correo del usuario

      // Si el pago fue aprobado, actualiza el pedido en Supabase
      if (pedidoId && paymentStatus === 'approved') {
        try {
          await this.supabaseService.pagarPedido(pedidoId, usuario);
          console.log('Pedido actualizado después de la confirmación de pago.');
        } catch (error) {
          console.error('Error al actualizar el pedido:', error);
        }
      } else {
        console.error('Pago no aprobado o pedidoId faltante.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/menu']);
  }





}