import { Component, Input, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workspace-setup-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace-setup-step.html',
  styleUrl: './workspace-setup-step.css',
})
export class WorkspaceSetupStepComponent {
  @Input() userId = '';
  @Output() done = new EventEmitter<any>();

  workspaceName = 'Mi Empresa S.A.';
  domain = 'miempresa';
  timezone = '(GMT-05:00) Lima';
  teamEmail = '';
  teamEmails = signal<string[]>([]);
  loading = signal(false);

  timezones = ['(GMT-05:00) Lima', '(GMT-06:00) Central America', '(GMT-07:00) Mountain', '(GMT-08:00) Pacific', '(GMT+00:00) UTC', '(GMT+01:00) Madrid'];

  addEmail() {
    if (this.teamEmail && !this.teamEmails().includes(this.teamEmail)) {
      this.teamEmails.update(e => [...e, this.teamEmail]);
      this.teamEmail = '';
    }
  }

  removeEmail(email: string) {
    this.teamEmails.update(e => e.filter(x => x !== email));
  }

  onDone() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.done.emit({ workspaceName: this.workspaceName, domain: this.domain, timezone: this.timezone, teamEmails: this.teamEmails() });
    }, 800);
  }
}
