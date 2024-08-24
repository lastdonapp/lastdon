import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';  // Importa HttpClientTestingModule
import { DetallesPedidoPage } from './detalles-pedido.page';

describe('DetallesPedidoPage', () => {
  let component: DetallesPedidoPage;
  let fixture: ComponentFixture<DetallesPedidoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetallesPedidoPage],
      imports: [HttpClientTestingModule],  // Añade HttpClientTestingModule
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of({}) } }  // Proporciona un valor simulado para ActivatedRoute
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallesPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
