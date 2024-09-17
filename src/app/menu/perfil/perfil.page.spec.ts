import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';  // Importa HttpClientModule
import { ModalController } from '@ionic/angular';  // Importa ModalController
import { PerfilPage } from './perfil.page';

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfilPage],
      imports: [HttpClientModule],  // Importa HttpClientModule
      providers: [
        { provide: ModalController, useValue: {} }  // Proporciona un valor simulado para ModalController
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
