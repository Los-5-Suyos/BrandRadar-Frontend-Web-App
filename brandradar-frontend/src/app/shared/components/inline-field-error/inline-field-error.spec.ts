import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineFieldError } from './inline-field-error';

describe('InlineFieldError', () => {
  let component: InlineFieldError;
  let fixture: ComponentFixture<InlineFieldError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineFieldError],
    }).compileComponents();

    fixture = TestBed.createComponent(InlineFieldError);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
