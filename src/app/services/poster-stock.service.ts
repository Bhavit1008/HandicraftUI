import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PosterStock, PosterStockHistory, PosterStockUpdate } from '../model/poster-stock';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PosterStockService {
  private readonly baseUrl = `${environment.apiUrl}/posterStock`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private performedByHeaders(): HttpHeaders {
    const employeeName = this.auth.getCurrentUser();
    return employeeName ? new HttpHeaders({ 'X-Employee-Name': employeeName }) : new HttpHeaders();
  }

  getAll(): Observable<PosterStock[]> {
    return this.http.get<PosterStock[]>(this.baseUrl);
  }

  /** Saves new stock counts and returns the full, updated list. */
  updateStock(updates: PosterStockUpdate[]): Observable<PosterStock[]> {
    return this.http.put<PosterStock[]>(`${this.baseUrl}/stock`, updates, { headers: this.performedByHeaders() });
  }

  /** Stock changes between two days (inclusive, yyyy-MM-dd), newest first. */
  getHistory(from: string, to: string, posterStockId?: string): Observable<PosterStockHistory[]> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (posterStockId) params = params.set('posterStockId', posterStockId);
    return this.http.get<PosterStockHistory[]>(`${this.baseUrl}/history`, { params });
  }
}
