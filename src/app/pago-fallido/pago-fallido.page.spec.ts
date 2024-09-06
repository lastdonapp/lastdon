import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoFallidoPage } from './pago-fallido.page';

describe('PagoFallidoPage', () => {
  let component: PagoFallidoPage;
  let fixture: ComponentFixture<PagoFallidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagoFallidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
