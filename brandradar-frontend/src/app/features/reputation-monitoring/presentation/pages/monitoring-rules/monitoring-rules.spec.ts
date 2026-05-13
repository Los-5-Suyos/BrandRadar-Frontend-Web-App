import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringRules } from './monitoring-rules';

describe('MonitoringRules', () => {
  let component: MonitoringRules;
  let fixture: ComponentFixture<MonitoringRules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoringRules],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitoringRules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
