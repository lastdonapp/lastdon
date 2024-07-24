import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConductorMenuPage } from './conductor-menu.page';

describe('ConductorMenuPage', () => {
  let component: ConductorMenuPage;
  let fixture: ComponentFixture<ConductorMenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConductorMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
