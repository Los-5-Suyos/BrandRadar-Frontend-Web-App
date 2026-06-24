import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  router = inject(Router);

  fullName = '';
  bio = '';
  language = 'ES';
  timezone = 'GMT-5';
  emailNotifications = true;

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  get userEmail() {
    return typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
  }

  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
