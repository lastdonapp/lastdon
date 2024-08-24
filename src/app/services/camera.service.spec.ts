import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';  // Importa HttpClientTestingModule si se usa HttpClient en el servicio
import { CameraService } from './camera.service';

describe('CameraService', () => {
  let service: CameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]  // Añade HttpClientTestingModule si se usa HttpClient
    });
    service = TestBed.inject(CameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
