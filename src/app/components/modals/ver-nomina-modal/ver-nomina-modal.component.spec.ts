import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VerNominaModalComponent } from './ver-nomina-modal.component';

describe('VerNominaModalComponent', () => {
  let component: VerNominaModalComponent;
  let fixture: ComponentFixture<VerNominaModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [VerNominaModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerNominaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
