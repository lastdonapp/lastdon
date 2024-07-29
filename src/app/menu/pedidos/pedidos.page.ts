import { Component, OnInit } from '@angular/core';
import { MercadoLibreService } from 'src/app/services/mercado-libre.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  pedidos: any[] = [];
  errorMessage: string | null = null;

  constructor(private mercadoLibreService: MercadoLibreService) {}

  ngOnInit() {
    this.loadPedidos();
  }

  loadPedidos() {
    this.mercadoLibreService.getOrders().subscribe({
      next: (data) => {
        console.log('Orders data:', data); // Log para ver los datos de los pedidos
        this.pedidos = data.results || [];
      },
      error: (error) => {
        console.error('Error loading orders:', error); // Log para ver cualquier error
        this.errorMessage = 'Error loading orders';
      }
    });
  }
}
