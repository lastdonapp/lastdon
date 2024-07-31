import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar-pedidos',
  templateUrl: './agregar-pedidos.page.html',
  styleUrls: ['./agregar-pedidos.page.scss'],
})
export class AgregarPedidosPage implements OnInit {
  pedido: any = {
    direccionPedido: '',
    direccionEntrega: '',
    nombreDestinatario: '',
    numeracionCasa: '',
    vivienda: '',
    comuna: '',
    telefono: '+569',
    cantidadPaquetes: 0,
    dimensiones: {
      valor: 0,
      unidad: 'metros'
    },
    fragil: false,
    cambio: false,
    excede10Kilos: false,
    costo: 0,
    estado: 'por tomar',
    fechaTomado: null,
    conductor: '',
    usuario: '',
    codigo: ''
  };

  comunas: string[] = [
    'Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'La Florida', 
    'Puente Alto', 'Maipú', 'San Bernardo', 'La Reina', 'Vitacura'
  ];

  telefonoInput: string = ''; // Input del teléfono sin el prefijo

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.supabaseService.getCurrentUser();
    this.pedido.usuario = user.email;
    this.pedido.codigo = this.generateUniqueCode();
  }

  onTelefonoChange(value: string) {
    // Asegura que solo se ingresen 8 dígitos
    if (/^\d{0,8}$/.test(value)) {
      this.telefonoInput = value;
      this.pedido.telefono = '+569' + value;
    }
  }

  onDimensionesChange() {
    // Actualiza el costo cuando se cambian las dimensiones o la unidad
    this.updateCosto();
  }

  async onSubmit() {
    try {
      this.pedido.costo = this.calculateCost();
      const { data, error } = await this.supabaseService.addPedido(this.pedido);
      if (error) {
        console.error('Error al agregar pedido:', error);
      } else {
        console.log('Pedido agregado:', data);
        this.router.navigate(['/menu']);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  }

  calculateCost() {
    let cost = 1000; // Costo base
    if (this.pedido.excede10Kilos) {
      cost += 2000;
    }
    if (this.pedido.fragil) {
      cost += 1000;
    }
    // Puedes agregar más lógica para calcular el costo basado en dimensiones y cantidad de paquetes
    return cost;
  }

  updateCosto() {
    // Lógica para actualizar el costo basado en las dimensiones y cantidad de paquetes
    let baseCost = 1000; // Costo base
    let dimensionCost = this.pedido.dimensiones.valor * (this.pedido.dimensiones.unidad === 'metros' ? 1000 : 10); // Ajusta la fórmula según tus necesidades

    // Ejemplo: incrementar costo por cantidad de paquetes
    let totalCost = baseCost + (this.pedido.cantidadPaquetes * dimensionCost);

    // Ajustar costo final
    this.pedido.costo = totalCost;
  }

  generateUniqueCode() {
    return 'PED-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}
