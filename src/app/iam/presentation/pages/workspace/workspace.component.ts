import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingSidebarComponent } from './../../../../shared/components/onboarding-sidebar/onboarding-sidebar.component';


@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, OnboardingSidebarComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class WorkspaceComponent {
  router = inject(Router);

  companyName = '';
  workspaceName = '';
  industry = '';
  websiteUrl = '';
  youtubeUrl = '';
  reddit = '';
  googleNews = '';

  inclusionKeywords: string[] = ['Bembos', 'Hamburguesas', 'Delivery'];
  exclusionKeywords: string[] = ['Trabajo', 'Empleo'];
  newInclusion = '';
  newExclusion = '';

  addInclusion() {
    if (this.newInclusion.trim()) {
      this.inclusionKeywords.push(this.newInclusion.trim());
      this.newInclusion = '';
    }
  }

  removeInclusion(i: number) {
    this.inclusionKeywords.splice(i, 1);
  }

  addExclusion() {
    if (this.newExclusion.trim()) {
      this.exclusionKeywords.push(this.newExclusion.trim());
      this.newExclusion = '';
    }
  }

  removeExclusion(i: number) {
    this.exclusionKeywords.splice(i, 1);
  }

  finish() {
    this.router.navigate(['/success']);
  }

  get selectedPlan() {
    return typeof window !== 'undefined' ? localStorage.getItem('selectedPlan') || 'basico' : 'basico';
  }

  get isPro() {
    return this.selectedPlan === 'pro' || this.selectedPlan === 'enterprise';
  }

}
