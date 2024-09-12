import { TestBed } from '@angular/core/testing';

import { WebpayplusService } from './webpayplus.service';

describe('WebpayplusService', () => {
  let service: WebpayplusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebpayplusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
