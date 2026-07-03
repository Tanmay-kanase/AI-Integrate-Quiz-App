import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingAssessment } from './coding-assessment';

describe('CodingAssessment', () => {
  let component: CodingAssessment;
  let fixture: ComponentFixture<CodingAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingAssessment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
