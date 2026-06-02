import { TestBed } from '@angular/core/testing';

import { Asistencias } from './asistencias';

describe('Asistencias', () => {
  let service: Asistencias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Asistencias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
