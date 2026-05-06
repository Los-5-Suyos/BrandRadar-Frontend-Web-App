import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandCreate } from './brand-create';

describe('BrandCreate', () => {
  let component: BrandCreate;
  let fixture: ComponentFixture<BrandCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
