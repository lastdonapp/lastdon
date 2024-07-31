import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarPedidosPage } from './agregar-pedidos.page';

describe('AgregarPedidosPage', () => {
  let component: AgregarPedidosPage;
  let fixture: ComponentFixture<AgregarPedidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarPedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
