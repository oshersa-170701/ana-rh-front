import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegistrarIncidenciaModalComponent } from './registrar-incidencia-modal.component';

describe('RegistrarIncidenciaModalComponent', () => {
  let component: RegistrarIncidenciaModalComponent;
  let fixture: ComponentFixture<RegistrarIncidenciaModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RegistrarIncidenciaModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarIncidenciaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
