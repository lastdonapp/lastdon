import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  // Importa HttpClientModule si es necesario
import { HistorialPage } from './historial.page';

describe('HistorialPage', () => {
  let component: HistorialPage;
  let fixture: ComponentFixture<HistorialPage>;

  beforeEach(async () => {  // Configuración asíncrona del TestBed
    await TestBed.configureTestingModule({
      declarations: [HistorialPage],
      imports: [HttpClientModule]  // Añade HttpClientModule si se usa HttpClient
    }).compileComponents();  // Compila los componentes y módulos

    fixture = TestBed.createComponent(HistorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detecta y aplica los cambios en la vista
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
