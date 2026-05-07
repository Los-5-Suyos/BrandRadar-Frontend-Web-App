import { TestBed } from '@angular/core/testing';

import { Mention } from './mention';

describe('Mention', () => {
  let service: Mention;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Mention);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
