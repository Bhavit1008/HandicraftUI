import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Employee } from '../model/employee';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.baseUrl);
  }

  add(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, employee);
  }

  update(id: string, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, employee);
  }

  delete(id: string, requestedBy: string | null): Observable<object> {
    let params = new HttpParams();
    if (requestedBy) params = params.set('requestedBy', requestedBy);
    return this.http.delete(`${this.baseUrl}/${id}`, { params });
  }

  login(employeeName: string, password: string): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/login`, { employeeName, password });
  }
}
