import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { AgregarPedidosPage } from './agregar-pedidos.page';
import { ToastController } from '@ionic/angular';  
import { SupabaseService } from 'src/app/services/supabase.service';
import { of } from 'rxjs';

class MockSupabaseService {
  getCurrentUser() {
    return { email: 'test@example.com' }; // Devuelve un usuario simulado
  }
  
  getPedidosPorTomar() {
    return Promise.resolve([]); // Devuelve una lista vacía de pedidos simulada
  }

  tomarPedido(pedidoId: string, email: string) {
    return Promise.resolve(); // Simula la toma de un pedido
  }
}

describe('AgregarPedidosPage', () => {
  let component: AgregarPedidosPage;
  let fixture: ComponentFixture<AgregarPedidosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarPedidosPage],
      imports: [
        HttpClientModule,  
        FormsModule,  
        ReactiveFormsModule  
      ],
      providers: [
        ToastController,  
        { provide: SupabaseService, useClass: MockSupabaseService }  // Proporciona el mock para SupabaseService
      ]
    }).compileComponents();  

    fixture = TestBed.createComponent(AgregarPedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();  
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
