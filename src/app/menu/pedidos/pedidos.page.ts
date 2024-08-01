// pedidos.page.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {
  pedidos: any[] = [];
  usuario: any = this.supabaseService.getCurrentUser();
  dimensiones: any = ''

  constructor(private supabaseService: SupabaseService, private toastController: ToastController) { }

  ngOnInit() {
    this.loadPedidos();
  }

  async loadPedidos() {
    try {
      console.log(this.usuario)
      this.pedidos = await this.supabaseService.getPedidos(this.usuario.email);
      this.pedidos.forEach((pedido: any) =>{
        if (pedido.dimensiones){
          pedido.dimensiones = JSON.parse(pedido.dimensiones);
        }
      });
      if (this.pedidos.length === 0) {
        this.showToast('No tienes pedidos actualmente.');
      }
    } catch (error) {
      this.showToast('Error al cargar los pedidos.');
      console.error('Error al cargar los pedidos:', error);
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
