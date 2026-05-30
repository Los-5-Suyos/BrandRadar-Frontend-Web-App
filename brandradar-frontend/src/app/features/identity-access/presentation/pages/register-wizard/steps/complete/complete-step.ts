import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-complete-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complete-step.html',
  styleUrl: './complete-step.css',
})
export class CompleteStepComponent {
  @Output() goToDashboard = new EventEmitter<void>();
}
