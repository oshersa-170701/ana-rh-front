import { TestBed } from '@angular/core/testing';

import { Nominas } from './nominas';

describe('Nominas', () => {
  let service: Nominas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Nominas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
