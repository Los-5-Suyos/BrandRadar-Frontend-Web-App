import { TestBed } from '@angular/core/testing';
import { WorkspaceState } from './workspace-state';

describe('WorkspaceState', () => {
  let service: WorkspaceState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkspaceState],
    });
    service = TestBed.inject(WorkspaceState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
