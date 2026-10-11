import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EmployeeService } from './employee.service';
import { EmployeeRole } from '../model/employee';
import { environment } from '../../environments/environment';

export interface AppUser {
  loginId: string;
  role: EmployeeRole;
  assignedLocations: string[];
}

const ROLE_KEY = 'handicraft-user-role';
const USER_KEY = 'handicraft-user-id';
const LOCATIONS_KEY = 'handicraft-user-locations';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private employeeService: EmployeeService) {}

  /** Validates credentials against the Employee collection. In development builds, environment.devLogin is accepted first. */
  async validateUser(loginId: string, password: string): Promise<AppUser | null> {
    const devLogin = environment.devLogin;
    if (devLogin && loginId.trim() === devLogin.loginId && password === devLogin.password) {
      return {
        loginId: devLogin.loginId,
        role: devLogin.role,
        assignedLocations: devLogin.assignedLocations
      };
    }

    try {
      const employee = await firstValueFrom(this.employeeService.login(loginId.trim(), password));
      if (!employee?.role) return null;
      return {
        loginId: employee.employeeName,
        role: employee.role,
        assignedLocations: employee.assignedLocations || []
      };
    } catch {
      return null;
    }
  }

  setCurrentUser(user: AppUser): void {
    localStorage.setItem(USER_KEY, user.loginId);
    localStorage.setItem(ROLE_KEY, user.role);
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(user.assignedLocations || []));
  }

  getCurrentUser(): string | null {
    return localStorage.getItem(USER_KEY);
  }

  getCurrentRole(): EmployeeRole | null {
    return localStorage.getItem(ROLE_KEY) as EmployeeRole | null;
  }

  getCurrentLocations(): string[] {
    try {
      const raw = localStorage.getItem(LOCATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  isAdmin(): boolean {
    return this.getCurrentRole() === 'admin';
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  clearSession(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(LOCATIONS_KEY);
  }
}
