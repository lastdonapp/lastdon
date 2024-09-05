import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MercadoPagoService } from 'src/app/services/mercado-pago.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {
  pedidos: any[] = [];
  selectedState: string = '';
  totalCosto: number = 0;// Nueva propiedad para almacenar el costo total
  usuario: any = this.supabaseService.getCurrentUser();


  constructor(private supabaseService: SupabaseService, private toastController: ToastController, private router: Router, private mercadoPagoService: MercadoPagoService) {}

  ngOnInit() {
    this.loadPedidos();
  }

  async loadPedidos() {
    try {
      const user = this.supabaseService.getCurrentUser();
      const email = user.email;
      await this.getPedidos(email);
      this.calculateTotalCost(); // Calcular el costo total después de cargar los pedidos
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  }

  async getPedidos(email: string) {
    try {
      const pedidos = await this.supabaseService.getPedidosPorUsuarioPorpagar(email, this.selectedState);
      this.pedidos = pedidos;
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
    }
  }

  calculateTotalCost() {
    this.totalCosto = this.pedidos
      .filter(pedido => !pedido.pagado) // Filtrar pedidos no pagados
      .reduce((total, pedido) => total + pedido.costo, 0); // Sumar los costos
  
    // Redondear el total y formatearlo como CLP sin decimales
    this.totalCosto = Math.round(this.totalCosto);
  }

  filterPedidos() {
    this.loadPedidos();
  }
   

  async pagarPedido(pedidoId: string) {
    try {
      // Obtener los detalles del pedido para la preferencia de Mercado Pago
      const pedido = this.pedidos.find(p => p.id === pedidoId);
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }
  
      // Crear la preferencia de Mercado Pago
      const items = [{
        title: 'Servicio de Envío',
        name : pedido.nombrePedido,
        quantity: 1,
        currency_id: 'CLP',
        unit_price: Number(pedido.costo)
      }];
  
      // Aquí se pasa el pedidoId además de los items
      const response = await this.mercadoPagoService.createPreference(items, pedidoId).toPromise();
      const preferenceId = response.id;
      console.log('Preference ID:', preferenceId);
  
      // Redirigir al usuario a la página de pago de Mercado Pago
      window.location.href = window.location.href = `https://www.mercadopago.cl/checkout/v1/redirect?preference-id=${preferenceId}`;
  
      // Actualizar el estado del pedido en el backend
      await this.supabaseService.pagarPedido(pedidoId, this.usuario.email);
  
      // Mostrar mensaje de éxito
      const toast = await this.toastController.create({
        message: 'Pedido pagado con éxito',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      // Recargar los pedidos después de tomar uno
      this.loadPedidos();
    } catch (error) {
      console.error('Error al pagar el pedido:', error);
    }
  }






}
