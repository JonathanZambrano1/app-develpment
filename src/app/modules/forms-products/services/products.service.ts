import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Product, ProductApi, ProductApiUpdate } from './Vo/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  private readonly API_URL = '/bp/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<{ data: ProductApi[] }>(this.API_URL).pipe(
      map(response => response.data.map(api => this.mapToProduct(api)))
    );
  }

  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/verification/${id}`).pipe(
      catchError(err => {
        const message = err?.error?.message || 'Error al verificar el ID';
        return throwError(() => new Error(message));
      })
    );
  }


  createProduct(product: Product): Observable<Product> {
    const body: ProductApi = {
      id: product.productId,
      name: product.nombre,
      description: product.descripcion,
      logo: product.logo,
      date_release: new Date(product.fechaLiberacion).toISOString(),
      date_revision: new Date(product.fechaReestructuracion).toISOString()
    };

    return this.http.post<{ message: string; data: ProductApi }>(this.API_URL, body).pipe(
      map(res => this.mapToProduct(res.data)),
      catchError(err => throwError(() => new Error(err?.error?.message || 'Error al guardar producto')))
    );
  }

  updateProduct(product: Product): Observable<Product> {
    const body: ProductApiUpdate = {
      name: product.nombre,
      description: product.descripcion,
      logo: product.logo,
      date_release: new Date(product.fechaLiberacion).toISOString(),
      date_revision: new Date(product.fechaReestructuracion).toISOString()
    };

    return this.http.put<{ message: string; data: ProductApi }>(
      `${this.API_URL}/${product.productId}`,
      body
    ).pipe(
      map(res => this.mapToProduct(res.data)),
      catchError(err => {
        const message = err?.error?.message || 'Error al actualizar el producto';
        return throwError(() => new Error(message));
      })
    );
  }



  deleteProduct(id: string): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`).pipe(
      map(() => void 0),
      catchError(err => {
        const message = err?.error?.message || 'Error al eliminar el producto';
        return throwError(() => new Error(message));
      })
    );
  }

  private parseDateUTC(dateStr?: string | null): Date {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    // Crea un Date con la misma fecha en UTC, ignorando la zona horaria local
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
  private mapToProduct(api: ProductApi): Product {
    return {
      productId: api.id || '',
      nombre: api.name || '',
      descripcion: api.description || '',
      logo: api.logo || '',
      fechaLiberacion: this.parseDateUTC(api.date_release),
      fechaReestructuracion: this.parseDateUTC(api.date_revision),
    };
  }


}
