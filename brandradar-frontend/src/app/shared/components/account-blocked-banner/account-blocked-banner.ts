import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-blocked-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-blocked-banner.html',
  styleUrl: './account-blocked-banner.css'
})
export class AccountBlockedBanner {
  @Input() visible: boolean = false;
}
