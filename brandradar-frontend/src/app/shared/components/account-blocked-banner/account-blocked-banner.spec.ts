import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBlockedBanner } from './account-blocked-banner';

describe('AccountBlockedBanner', () => {
  let component: AccountBlockedBanner;
  let fixture: ComponentFixture<AccountBlockedBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountBlockedBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountBlockedBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
