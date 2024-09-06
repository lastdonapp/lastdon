import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago-pendiente',
  templateUrl: './pago-pendiente.page.html',
  styleUrls: ['./pago-pendiente.page.scss'],
})
export class PagoPendientePage implements OnInit {
  pedidoId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.pedidoId = this.route.snapshot.queryParamMap.get('pedidoId');
    console.warn('Pago pendiente para el pedido:', this.pedidoId);
  }


  goBack() {
    this.router.navigate(['/menu']);
  }
}
