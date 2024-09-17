import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';  // Importa HttpClientTestingModule
import { HashingService } from './hashing.service';

describe('HashingService', () => {
  let service: HashingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],  // Asegúrate de incluir HttpClientTestingModule si es necesario
      providers: [HashingService]  // Asegúrate de proporcionar HashingService aquí
    });
    service = TestBed.inject(HashingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
