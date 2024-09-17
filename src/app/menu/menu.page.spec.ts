import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  // Importa HttpClientModule si es necesario
import { MenuPage } from './menu.page';

describe('MenuPage', () => {
  let component: MenuPage;
  let fixture: ComponentFixture<MenuPage>;

  beforeEach(async () => {  // Configuración asíncrona del TestBed
    await TestBed.configureTestingModule({
      declarations: [MenuPage],
      imports: [HttpClientModule]  // Añade HttpClientModule si se usa HttpClient
    }).compileComponents();  // Compila los componentes y módulos

    fixture = TestBed.createComponent(MenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detecta y aplica los cambios en la vista
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
