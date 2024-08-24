import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  // Importa HttpClientModule
import { ConductorMenuPage } from './conductor-menu.page';

describe('ConductorMenuPage', () => {
  let component: ConductorMenuPage;
  let fixture: ComponentFixture<ConductorMenuPage>;

  beforeEach(async () => {  // Añadimos async para asegurar que se esperan las operaciones asíncronas
    await TestBed.configureTestingModule({
      declarations: [ConductorMenuPage],
      imports: [HttpClientModule]  // Añade HttpClientModule en los imports
    }).compileComponents();  // Compila los componentes

    fixture = TestBed.createComponent(ConductorMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detecta cambios en la vista
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
