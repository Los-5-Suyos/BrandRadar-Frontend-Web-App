import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-severity-badge',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './severity-badge.html',
  styleUrl: './severity-badge.css',
})
export class SeverityBadge {
  @Input() status: string = '';
}
