import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingSidebarComponent } from './../../../../shared/components/onboarding-sidebar/onboarding-sidebar.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, FormsModule, OnboardingSidebarComponent],
  templateUrl: './success.component.html',
  styleUrl: './success.component.css'
})
export class SuccessComponent {
  router = inject(Router);
}
