import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegistrarNominaModalComponent } from './registrar-nomina-modal.component';

describe('RegistrarNominaModalComponent', () => {
  let component: RegistrarNominaModalComponent;
  let fixture: ComponentFixture<RegistrarNominaModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RegistrarNominaModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarNominaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
