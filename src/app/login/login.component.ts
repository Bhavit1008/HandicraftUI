import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  employeeName = '';
  password = '';
  errorMessage: string | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async login(): Promise<void> {
    if (!this.employeeName.trim() || !this.password) {
      this.errorMessage = 'Please enter both employee name and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const user = await this.auth.validateUser(this.employeeName, this.password);
    this.loading = false;

    if (!user) {
      this.errorMessage = 'Invalid employee name or password.';
      return;
    }

    this.auth.setCurrentUser(user);
    this.router.navigate(['/items']);
  }
}
