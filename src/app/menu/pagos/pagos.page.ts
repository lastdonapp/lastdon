import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

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

  constructor(private supabaseService: SupabaseService, private toastController: ToastController, private router: Router) {}

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
  }

  filterPedidos() {
    this.loadPedidos();
  }
  async pagarPedido(pedidoId: string) {
    try {
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
      console.error('Error al tomar el pedido:', error);
    }
  }
  

 goBack() { 
 this.router.navigate(['/menu']);
}






}
