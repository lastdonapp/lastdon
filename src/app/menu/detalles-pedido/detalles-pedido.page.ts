import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-detalles-pedido',
  templateUrl: './detalles-pedido.page.html',
  styleUrls: ['./detalles-pedido.page.scss'],
})
export class DetallesPedidoPage implements OnInit {
  pedido: any;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.loadPedido();
  }

  async loadPedido() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const { data, error } = await this.supabaseService.getPedidoById(id);
        if (error) {
          throw new Error(error.message);
        }
        this.pedido = data;
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
      }
    }
  }
}
