import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from './services/products.service';
import { Product as ProductModel } from './services/Vo/product.model';
import { HttpClientModule } from '@angular/common/http';
import { finalize, of, switchMap, throwError } from 'rxjs';

interface ProductView {
  productId: string;
  logo: string;
  nombre: string;
  descripcion: string;
  fechaLiberacion: Date;
  fechaReestructuracion: Date;
}

@Component({
  selector: 'app-forms-products',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, HttpClientModule],
  templateUrl: './forms-products.component.html',
  styleUrl: './forms-products.component.scss'
})
export class FormsProductsComponent implements OnInit {

  products: ProductView[] = [];
  filteredProducts: ProductView[] = [];
  paginatedProducts: ProductView[] = [];

  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 5;

  showModal = false;
  showDeleteModal = false;
  productToDelete: ProductView | null = null;
  openMenuId: string | null = null;
  menuPosition = { top: 0, left: 0 };

  productIdError: string | null = null;
  nombreError: string | null = null;
  descripcionError: string | null = null;
  logoError: string | null = null;
  fechaLiberacionError: string | null = null;
  fechaRevisionError: string | null = null;

  isSaving = false;
  isLoading = false;
  skeletonRows: number[] = [];
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  errorMessage = '';
  saveMessage: string | null = null;
  saveMessageType: 'success' | 'error' | null = null;


  readonly descripcionMinLength = 10;
  readonly descripcionMaxLength = 200;

  newProduct: any = {};
  isEditing = false;

  constructor(private productsService: ProductsService) { }

  ngOnInit(): void {
    this.skeletonRows = this.buildSkeletonRows();
    this.loadProducts();
    this.applyFilter();
  }

  setDefaultImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/defecto.png';
  }


  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.skeletonRows = this.buildSkeletonRows();
    this.updatePagination();
  }


  openModal(): void {
    this.isEditing = false;
    this.newProduct = {};
    this.showModal = true;
    this.resetErrors();
  }

  closeModal() {
    this.showModal = false;
    this.resetErrors();
  }

  resetErrors() {
    this.productIdError = null;
    this.nombreError = null;
    this.descripcionError = null;
    this.logoError = null;
    this.fechaLiberacionError = null;
    this.fechaRevisionError = null;
  }

  get hasResults(): boolean {
    return this.filteredProducts.length > 0;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  get isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  get isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }

  get paginationInfo() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
    return { start, end };
  }


  get pages(): number[] {
    const visible = 5;
    const start = Math.max(1, this.currentPage - 2);
    return Array
      .from({ length: Math.min(visible, this.totalPages) }, (_, i) => start + i)
      .filter(p => p <= this.totalPages);
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  }

  performSearch(): void {
    this.applyFilter();
    this.goToPage(1);
  }

  private applyFilter(): void {
    this.filteredProducts = this.searchTerm
      ? this.products.filter(p =>
        p.nombre.toLowerCase().includes(this.searchTerm) ||
        p.descripcion.toLowerCase().includes(this.searchTerm) ||
        p.productId.toLowerCase().includes(this.searchTerm)
      )
      : [...this.products];

    this.updatePagination();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  private updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(start, start + this.itemsPerPage);
  }



  validateProduct(): boolean {
    let valid = true;
    this.resetErrors();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.isEditing) {
      if (!this.newProduct.productId) {
        this.productIdError = 'ID es requerido';
        valid = false;
      } else if (this.newProduct.productId.length < 3 || this.newProduct.productId.length > 10) {
        this.productIdError = 'ID debe tener entre 3 y 10 caracteres';
        valid = false;
      }
    }

    if (!this.newProduct.nombre) {
      this.nombreError = 'Nombre es requerido';
      valid = false;
    } else if (this.newProduct.nombre.length < 6 || this.newProduct.nombre.length > 100) {
      this.nombreError = 'Nombre debe tener entre 6 y 100 caracteres';
      valid = false;
    }

    if (!this.newProduct.descripcion) {
      this.descripcionError = 'Descripción es requerida';
      valid = false;
    } else if (this.newProduct.descripcion.length < 10 || this.newProduct.descripcion.length > 200) {
      this.descripcionError = 'Descripción debe tener entre 10 y 200 caracteres';
      valid = false;
    }

    if (!this.newProduct.logo) {
      this.logoError = 'Logo es requerido';
      valid = false;
    }

    if (!this.newProduct.fechaLiberacion) {
      this.fechaLiberacionError = 'Fecha de liberación es requerida';
      valid = false;
    } else {
      const fechaLiber = new Date(this.newProduct.fechaLiberacion);
      fechaLiber.setHours(0, 0, 0, 0);

      if (fechaLiber < today) {
        this.fechaLiberacionError = 'Fecha de liberación no puede ser menor a hoy';
        valid = false;
      }
    }

    if (!this.newProduct.fechaReestructuracion) {
      this.fechaRevisionError = 'Fecha de revisión es requerida';
      valid = false;
    } else if (this.newProduct.fechaLiberacion) {
      const fechaLiber = new Date(this.newProduct.fechaLiberacion);
      fechaLiber.setHours(0, 0, 0, 0);
      const fechaRev = new Date(this.newProduct.fechaReestructuracion);
      fechaRev.setHours(0, 0, 0, 0);
      const expectedRev = new Date(fechaLiber);
      expectedRev.setFullYear(fechaLiber.getFullYear() + 1);
      const fechaRevStr = fechaRev.toISOString().split('T')[0];
      const expectedRevStr = expectedRev.toISOString().split('T')[0];

      if (fechaRevStr !== expectedRevStr) {
        this.fechaRevisionError =
          'Fecha de revisión debe ser exactamente un año posterior a la liberación';
        valid = false;
      }
    }

    return valid;
  }


  toggleMenu(productId: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.openMenuId === productId) {
      this.openMenuId = null;
    } else {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.menuPosition = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 80
      };
      this.openMenuId = productId;
    }
  }

  getCurrentProduct(): ProductView {
    return this.products.find(p => p.productId === this.openMenuId) || this.products[0];
  }

  @HostListener('document:click')
  closeMenu() {
    this.openMenuId = null;
  }

  get isFormValid(): boolean {
    const p = this.newProduct;

    return (
      !!p.productId?.trim() &&
      !!p.nombre?.trim() &&
      !!p.descripcion?.trim() &&
      !!p.logo?.trim() &&
      !!p.fechaLiberacion
    );
  }



  onDescripcionChange(): void {
    const length = this.newProduct.descripcion.trim().length;
    if (length && length < this.descripcionMinLength) {
      this.descripcionError = `Mínimo ${this.descripcionMinLength} caracteres`;
    } else if (length > this.descripcionMaxLength) {
      this.descripcionError = `Máximo ${this.descripcionMaxLength} caracteres`;
    } else {
      this.descripcionError = '';
    }
  }

  onProductIdChange(): void {
    const id = this.newProduct.productId.trim().toLowerCase();
    this.productIdError = this.products.some(p => p.productId.toLowerCase() === id)
      ? 'ID ya existente'
      : '';
  }

  saveProduct(): void {
    if (!this.validateProduct()) return;
    this.isSaving = true;
    const checkId$ = this.isEditing
      ? of(false)
      : this.productsService.verifyProductId(this.newProduct.productId);

    checkId$
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
        switchMap(exists => {
          if (exists) {
            this.productIdError = 'ID ya existe';
            return throwError(() => new Error('ID ya existe'));
          }
          this.productIdError = null;
          const product = this.toDomain(this.newProduct);
          return this.isEditing
            ? this.productsService.updateProduct(product)
            : this.productsService.createProduct(product);
        })
      )
      .subscribe({
        next: () => {
          this.loadProducts();
          this.performSearch();
          this.closeModal();
          this.showToast(
            this.isEditing ? 'Producto actualizado correctamente' : 'Producto agregado correctamente',
            'success'
          );
        },
        error: (err: any) => {
          if (err.message !== 'ID ya existe') {
            this.showToast(err.message || 'Error al guardar producto', 'error');
          }
        }
      });
  }


  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 10000);
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.productsService.getProducts()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (products) => {
          this.products = products;
          this.applyFilter();
        },
        error: (err) => {
          console.error('Error cargando productos', err);
        }
      });
  }

  onFechaLiberacionChange(fecha: string): void {
    if (!fecha) {
      this.newProduct.fechaReestructuracion = '';
      return;
    }
    const fechaLiber = new Date(fecha);
    const fechaRev = new Date(fechaLiber);
    fechaRev.setFullYear(fechaLiber.getFullYear() + 1);
    this.newProduct.fechaReestructuracion = fechaRev.toISOString().split('T')[0];
  }


  editProduct(product: ProductView): void {
    this.isEditing = true;

    this.newProduct = {
      ...product,
      fechaLiberacion: product.fechaLiberacion
        ? this.formatDateForInput(product.fechaLiberacion)
        : null,
      fechaReestructuracion: product.fechaReestructuracion
        ? this.formatDateForInput(product.fechaReestructuracion)
        : null
    };

    this.showModal = true;
  }


  private formatDateForInput(date: Date): string {
    if (!date) return '';
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  formatDateForTable(date?: Date): string {
    if (!date) return '';
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  private toDomain(formValue: any): ProductModel {
    const fechaLiberacion = formValue?.fechaLiberacion
      ? new Date(formValue.fechaLiberacion)
      : new Date();
    const fechaReestructuracion = formValue?.fechaReestructuracion
      ? new Date(formValue.fechaReestructuracion)
      : new Date();

    return {
      productId: String(formValue?.productId ?? ''),
      nombre: String(formValue?.nombre ?? ''),
      descripcion: String(formValue?.descripcion ?? ''),
      logo: String(formValue?.logo ?? ''),
      fechaLiberacion,
      fechaReestructuracion,
    };
  }

  private buildSkeletonRows(): number[] {
    return Array.from({ length: this.itemsPerPage }, (_, i) => i);
  }

  deleteProduct(product: ProductView) {
    this.productToDelete = product;
    this.showDeleteModal = true;
    this.openMenuId = null;
  }

  confirmDelete() {
    if (this.productToDelete) {
      this.isSaving = true;
      this.productsService.deleteProduct(this.productToDelete.productId).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.productId !== this.productToDelete!.productId);
          this.performSearch();
          this.showToast('Producto eliminado correctamente', 'success');
          this.isSaving = false;
          this.closeDeleteModal();
        },
        error: (err) => {
          this.showToast(err?.message || 'Error al eliminar producto', 'error');
          this.toastType = 'error';
          this.isSaving = false;
          setTimeout(() => this.toastMessage = '', 3000);
        }
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  resetForm(): void {
    this.newProduct = {};
    this.resetErrors();
    if (this.isEditing) {
      this.isEditing = false;
    }
  }

  closeModalOnOverlay(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeDeleteModalOnOverlay(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeDeleteModal();
    }
  }

}
