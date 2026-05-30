import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  email = signal('');
  verifying = signal(false);
  verified = signal(false);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    this.email.set(email);
  }

  simulateVerify() {
    this.verifying.set(true);
    setTimeout(() => {
      this.verifying.set(false);
      this.verified.set(true);
      setTimeout(() => this.router.navigate(['/auth/login']), 2500);
    }, 1800);
  }
}
