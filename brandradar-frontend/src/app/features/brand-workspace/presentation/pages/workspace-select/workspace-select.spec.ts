import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceSelect } from './workspace-select';

describe('WorkspaceSelect', () => {
  let component: WorkspaceSelect;
  let fixture: ComponentFixture<WorkspaceSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceSelect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
