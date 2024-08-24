import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  // Importa HttpClientModule si es necesario
import { PagosPage } from './pagos.page';

describe('PagosPage', () => {
  let component: PagosPage;
  let fixture: ComponentFixture<PagosPage>;

  beforeEach(async () => {  // Configuración asíncrona del TestBed
    await TestBed.configureTestingModule({
      declarations: [PagosPage],
      imports: [HttpClientModule]  // Añade HttpClientModule si se usa HttpClient
    }).compileComponents();  // Compila los componentes y módulos

    fixture = TestBed.createComponent(PagosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detecta y aplica los cambios en la vista
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
