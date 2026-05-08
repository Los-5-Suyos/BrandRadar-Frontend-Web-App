import { TestBed } from '@angular/core/testing';

import { MonitoringRule } from './monitoring-rule';

describe('MonitoringRule', () => {
  let service: MonitoringRule;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitoringRule);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
