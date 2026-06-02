import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VerIndicenciaModalComponent } from './ver-indicencia-modal.component';

describe('VerIndicenciaModalComponent', () => {
  let component: VerIndicenciaModalComponent;
  let fixture: ComponentFixture<VerIndicenciaModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [VerIndicenciaModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerIndicenciaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
