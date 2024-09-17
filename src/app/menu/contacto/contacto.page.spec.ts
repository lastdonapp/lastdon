import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  // Importa HttpClientModule si es necesario
import { ContactoPage } from './contacto.page';

describe('ContactoPage', () => {
  let component: ContactoPage;
  let fixture: ComponentFixture<ContactoPage>;

  beforeEach(async () => {  // Configuración asíncrona del TestBed
    await TestBed.configureTestingModule({
      declarations: [ContactoPage],
      imports: [HttpClientModule]  // Añade HttpClientModule si se usa HttpClient
    }).compileComponents();  // Compila los componentes y módulos

    fixture = TestBed.createComponent(ContactoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detecta y aplica los cambios en la vista
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
