import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesPedidoPage } from './detalles-pedido.page';

describe('DetallesPedidoPage', () => {
  let component: DetallesPedidoPage;
  let fixture: ComponentFixture<DetallesPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
