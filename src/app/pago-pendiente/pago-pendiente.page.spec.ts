import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoPendientePage } from './pago-pendiente.page';

describe('PagoPendientePage', () => {
  let component: PagoPendientePage;
  let fixture: ComponentFixture<PagoPendientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagoPendientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
