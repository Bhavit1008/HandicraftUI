import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Item, ItemPage } from '../model/item';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private performedByHeaders(): HttpHeaders {
    const employeeName = this.auth.getCurrentUser();
    return employeeName ? new HttpHeaders({ 'X-Employee-Name': employeeName }) : new HttpHeaders();
  }

  save(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.baseUrl}/addItem`, item, { headers: this.performedByHeaders() });
  }

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}/getAllItems`);
  }

  getById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/items/${id}`);
  }

  getPage(category?: string, page = 0, size = 20): Observable<ItemPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (category) params = params.set('category', category);
    return this.http.get<ItemPage>(`${this.baseUrl}/items`, { params });
  }

  delete(id: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteItem/${id}`, {
      headers: this.performedByHeaders(),
      responseType: 'text'
    });
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.baseUrl}/upload-image`, formData, { responseType: 'text' });
  }
}
