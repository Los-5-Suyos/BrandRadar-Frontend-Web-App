import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inline-field-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inline-field-error.html',
  styleUrl: './inline-field-error.css',
})
export class InlineFieldError {
  @Input() message: string | null = null;
}
