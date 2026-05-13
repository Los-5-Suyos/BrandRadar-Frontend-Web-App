import { TestBed } from '@angular/core/testing';

import { SourceApi } from './source-api';

describe('SourceApi', () => {
  let service: SourceApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SourceApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
