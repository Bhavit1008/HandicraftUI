import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Employee } from '../model/employee';
import { AuthService } from '../services/auth.service';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  showForm = false;
  errorMessage: string | null = null;

  draft: Employee = this.emptyDraft();
  /** Comma-separated locations, bound to a plain text input and split into draft.assignedLocations on save. */
  locationsText = '';

  constructor(private employeeService: EmployeeService, private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.employeeService.getAll().subscribe(employees => (this.employees = employees));
  }

  emptyDraft(): Employee {
    return { employeeName: '', assignedLocations: [], role: 'store_manager' };
  }

  startAdd(): void {
    this.draft = this.emptyDraft();
    this.locationsText = '';
    this.showForm = true;
    this.errorMessage = null;
  }

  save(): void {
    const payload: Employee = {
      ...this.draft,
      assignedLocations: this.locationsText.split(',').map(l => l.trim()).filter(Boolean)
    };

    this.employeeService.add(payload).subscribe({
      next: () => {
        this.showForm = false;
        this.load();
      },
      error: err => (this.errorMessage = err?.error ?? 'Failed to add employee.')
    });
  }

  remove(employee: Employee): void {
    if (!employee.id || !confirm(`Remove "${employee.employeeName}"?`)) return;

    this.employeeService.delete(employee.id, this.auth.getCurrentUser()).subscribe({
      next: () => this.load(),
      error: err => alert(err?.error ?? 'Failed to delete employee.')
    });
  }
}
