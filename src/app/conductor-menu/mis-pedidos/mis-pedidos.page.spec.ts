import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  // Importa HttpClientModule si es necesario
import { MisPedidosPage } from './mis-pedidos.page';

describe('MisPedidosPage', () => {
  let component: MisPedidosPage;
  let fixture: ComponentFixture<MisPedidosPage>;

  beforeEach(async () => {  // Asegura la configuración asíncrona de TestBed
    await TestBed.configureTestingModule({
      declarations: [MisPedidosPage],
      imports: [HttpClientModule]  // Añade HttpClientModule en los imports si se usa HttpClient
    }).compileComponents();  // Compila los componentes y módulos necesarios

    fixture = TestBed.createComponent(MisPedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detecta y aplica cambios en la vista
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
