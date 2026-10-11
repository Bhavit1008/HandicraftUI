import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuditLog, AuditLogPage } from '../model/audit-log';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly baseUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 50): Observable<AuditLogPage> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<AuditLogPage>(this.baseUrl, { params });
  }

  getForEntity(entityId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/entity/${entityId}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
