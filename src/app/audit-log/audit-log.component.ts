import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuditLog } from '../model/audit-log';
import { AuditLogService } from '../services/audit-log.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css'
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  loading = true;

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.auditLogService.getAll().subscribe({
      next: page => {
        this.logs = page.content;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  remove(log: AuditLog): void {
    if (!confirm('Delete this audit log entry?')) return;

    this.auditLogService.delete(log.id).subscribe(() => {
      this.logs = this.logs.filter(l => l.id !== log.id);
    });
  }
}
