import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago-fallido',
  templateUrl: './pago-fallido.page.html',
  styleUrls: ['./pago-fallido.page.scss'],
})
export class PagoFallidoPage implements OnInit {
  pedidoId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.pedidoId = this.route.snapshot.queryParamMap.get('pedidoId');
    console.error('Pago fallido para el pedido:', this.pedidoId);
  }

  goBack() {
   this.router.navigate(['/menu']);
  }
}