import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceConnectionPage } from './source-connection.page';

describe('SourceConnectionPage', () => {
  let component: SourceConnectionPage;
  let fixture: ComponentFixture<SourceConnectionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceConnectionPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SourceConnectionPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
