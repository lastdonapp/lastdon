import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoAprobadoPage } from './pago-aprobado.page';

describe('PagoAprobadoPage', () => {
  let component: PagoAprobadoPage;
  let fixture: ComponentFixture<PagoAprobadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagoAprobadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
