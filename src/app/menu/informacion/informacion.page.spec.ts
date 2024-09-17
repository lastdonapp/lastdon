import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  // Importa HttpClientModule si es necesario
import { InformacionPage } from './informacion.page';

describe('InformacionPage', () => {
  let component: InformacionPage;
  let fixture: ComponentFixture<InformacionPage>;

  beforeEach(async () => {  // Configuración asíncrona del TestBed
    await TestBed.configureTestingModule({
      declarations: [InformacionPage],
      imports: [HttpClientModule]  // Añade HttpClientModule si se usa HttpClient
    }).compileComponents();  // Compila los componentes y módulos

    fixture = TestBed.createComponent(InformacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detecta y aplica los cambios en la vista
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
