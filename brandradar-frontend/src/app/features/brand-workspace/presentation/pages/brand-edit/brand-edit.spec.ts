import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandEdit } from './brand-edit';

describe('BrandEdit', () => {
  let component: BrandEdit;
  let fixture: ComponentFixture<BrandEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
