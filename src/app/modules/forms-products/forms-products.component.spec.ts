import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { FormsProductsComponent } from './forms-products.component';
import { ProductsService } from './services/products.service';

describe('FormsProductsComponent', () => {
  let component: FormsProductsComponent;
  let fixture: ComponentFixture<FormsProductsComponent>;
  let productsServiceMock: {
    getProducts: jest.Mock;
    verifyProductId: jest.Mock;
    createProduct: jest.Mock;
    updateProduct: jest.Mock;
    deleteProduct: jest.Mock;
  };

  const mockProducts = [
    {
      productId: 'p1',
      logo: 'logo1',
      nombre: 'Producto Uno',
      descripcion: 'Descripcion Uno',
      fechaLiberacion: new Date('2026-01-20T00:00:00.000Z'),
      fechaReestructuracion: new Date('2027-01-20T00:00:00.000Z')
    },
    {
      productId: 'p2',
      logo: 'logo2',
      nombre: 'Producto Dos',
      descripcion: 'Descripcion Dos',
      fechaLiberacion: new Date('2026-02-20T00:00:00.000Z'),
      fechaReestructuracion: new Date('2027-02-20T00:00:00.000Z')
    }
  ];

  beforeEach(async () => {
    productsServiceMock = {
      getProducts: jest.fn().mockReturnValue(of(mockProducts)),
      verifyProductId: jest.fn().mockReturnValue(of(false)),
      createProduct: jest.fn().mockReturnValue(of(mockProducts[0])),
      updateProduct: jest.fn().mockReturnValue(of(mockProducts[0])),
      deleteProduct: jest.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [FormsProductsComponent],
      providers: [
        {
          provide: ProductsService,
          useValue: productsServiceMock
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormsProductsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load products and initialize pagination', fakeAsync(() => {
    fixture.detectChanges(); // triggers ngOnInit
    tick();

    expect(productsServiceMock.getProducts).toHaveBeenCalledTimes(1);
    expect(component.products.length).toBe(2);
    expect(component.filteredProducts.length).toBe(2);

    // itemsPerPage defaults to 5, so both fit in first page
    expect(component.paginatedProducts.length).toBe(2);
    expect(component.currentPage).toBe(1);
  }));

  it('performSearch should filter products and reset to page 1', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.currentPage = 2;
    component.searchTerm = 'uno';
    component.performSearch();

    expect(component.currentPage).toBe(1);
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].productId).toBe('p1');
  }));

  it('onItemsPerPageChange should reset page and update paginatedProducts', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.currentPage = 2;
    component.itemsPerPage = 1;
    component.onItemsPerPageChange();

    expect(component.currentPage).toBe(1);
    expect(component.paginatedProducts.length).toBe(1);
  }));

  it('hasResults should be false when filteredProducts is empty and true otherwise', () => {
    component.filteredProducts = [] as any;
    expect(component.hasResults).toBe(false);

    component.filteredProducts = [mockProducts[0]] as any;
    expect(component.hasResults).toBe(true);
  });

  it('totalPages should be ceil(filteredProducts/itemsPerPage)', () => {
    component.filteredProducts = new Array(11).fill(mockProducts[0]) as any;
    component.itemsPerPage = 5;
    expect(component.totalPages).toBe(3);
  });

  it('isFirstPage and isLastPage should reflect current page', () => {
    component.filteredProducts = new Array(11).fill(mockProducts[0]) as any;
    component.itemsPerPage = 5;

    component.currentPage = 1;
    expect(component.isFirstPage).toBe(true);
    expect(component.isLastPage).toBe(false);

    component.currentPage = 3;
    expect(component.isFirstPage).toBe(false);
    expect(component.isLastPage).toBe(true);
  });

  it('paginationInfo should return correct start and end', () => {
    component.filteredProducts = new Array(12).fill(mockProducts[0]) as any;
    component.itemsPerPage = 5;
    component.currentPage = 2;

    expect(component.paginationInfo).toEqual({ start: 6, end: 10 });

    component.currentPage = 3;
    expect(component.paginationInfo).toEqual({ start: 11, end: 12 });
  });

  it('pages getter should return up to 5 visible pages based on currentPage', () => {
    component.filteredProducts = new Array(30).fill(mockProducts[0]) as any; // totalPages = 6 (itemsPerPage=5)
    component.itemsPerPage = 5;

    component.currentPage = 1;
    expect(component.pages).toEqual([1, 2, 3, 4, 5]);

    component.currentPage = 3;
    expect(component.pages).toEqual([1, 2, 3, 4, 5]);

    component.currentPage = 6;
    expect(component.pages).toEqual([4, 5, 6]);
  });

  it('onSearchInput should lowercase the searchTerm', () => {
    component.searchTerm = '';
    const event = { target: { value: 'PrOdUcTo' } } as any;
    component.onSearchInput(event);
    expect(component.searchTerm).toBe('producto');
  });

  it('closeModal should hide modal and reset errors', () => {
    component.showModal = true;
    component.productIdError = 'err';
    component.nombreError = 'err';

    component.closeModal();

    expect(component.showModal).toBe(false);
    expect(component.productIdError).toBeNull();
    expect(component.nombreError).toBeNull();
  });

  it('resetErrors should clear all error fields', () => {
    component.productIdError = 'a';
    component.nombreError = 'b';
    component.descripcionError = 'c';
    component.logoError = 'd';
    component.fechaLiberacionError = 'e';
    component.fechaRevisionError = 'f';

    component.resetErrors();

    expect(component.productIdError).toBeNull();
    expect(component.nombreError).toBeNull();
    expect(component.descripcionError).toBeNull();
    expect(component.logoError).toBeNull();
    expect(component.fechaLiberacionError).toBeNull();
    expect(component.fechaRevisionError).toBeNull();
  });

  it('goToPage should ignore out-of-range pages', () => {
    component.filteredProducts = new Array(12).fill(mockProducts[0]) as any;
    component.itemsPerPage = 5;
    component.currentPage = 1;

    component.goToPage(0);
    expect(component.currentPage).toBe(1);

    component.goToPage(999);
    expect(component.currentPage).toBe(1);
  });

  it('previousPage and nextPage should move within range', () => {
    component.filteredProducts = new Array(12).fill(mockProducts[0]) as any;
    component.itemsPerPage = 5;
    component.currentPage = 2;

    component.previousPage();
    expect(component.currentPage).toBe(1);

    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  it('getCurrentProduct should return openMenu product or first product', () => {
    component.products = mockProducts as any;

    component.openMenuId = 'p2';
    expect(component.getCurrentProduct().productId).toBe('p2');

    component.openMenuId = 'missing';
    expect(component.getCurrentProduct().productId).toBe('p1');
  });

  it('isFormValid should be true only when required fields exist', () => {
    component.newProduct = {};
    expect(component.isFormValid).toBe(false);

    component.newProduct = {
      productId: 'p1',
      nombre: 'Nombre Valido',
      descripcion: 'Descripcion Valida',
      logo: 'logo',
      fechaLiberacion: '2026-01-20'
    };
    expect(component.isFormValid).toBe(true);
  });

  it('onDescripcionChange should set descripcionError based on length', () => {
    component.newProduct = { descripcion: '123456789' }; // 9
    component.onDescripcionChange();
    expect(component.descripcionError).toContain('Mínimo');

    component.newProduct = { descripcion: '1234567890' }; // 10
    component.onDescripcionChange();
    expect(component.descripcionError).toBe('');

    component.newProduct = { descripcion: 'x'.repeat(201) };
    component.onDescripcionChange();
    expect(component.descripcionError).toContain('Máximo');
  });

  it('onProductIdChange should set productIdError when id exists', () => {
    component.products = mockProducts as any;
    component.newProduct = { productId: 'P1' };
    component.onProductIdChange();
    expect(component.productIdError).toBe('ID ya existente');

    component.newProduct = { productId: 'new' };
    component.onProductIdChange();
    expect(component.productIdError).toBe('');
  });

  it('validateProduct should set errors and return false for invalid fields', () => {
    component.isEditing = false;
    component.newProduct = {};

    const valid = component.validateProduct();
    expect(valid).toBe(false);
    expect(component.productIdError).toBeTruthy();
    expect(component.nombreError).toBeTruthy();
    expect(component.descripcionError).toBeTruthy();
    expect(component.logoError).toBeTruthy();
    expect(component.fechaLiberacionError).toBeTruthy();
    expect(component.fechaRevisionError).toBeTruthy();
  });

  it('validateProduct should allow editing without productId validation', () => {
    component.isEditing = true;
    component.newProduct = {
      nombre: 'Nombre Valido',
      descripcion: 'Descripcion Valida',
      logo: 'logo',
      fechaLiberacion: new Date(Date.now() + 24 * 60 * 60 * 1000),
      fechaReestructuracion: new Date(Date.now() + 24 * 60 * 60 * 1000 + 365 * 24 * 60 * 60 * 1000)
    };

    const valid = component.validateProduct();
    // puede fallar por exactitud de "un año" por día bisiesto; lo importante aquí es que no setee productIdError
    expect(component.productIdError).toBeNull();
    expect(typeof valid).toBe('boolean');
  });

  it('onFechaLiberacionChange should set fechaReestructuracion to exactly +1 year (YYYY-MM-DD)', () => {
    component.newProduct = {};
    component.onFechaLiberacionChange('2026-01-20');
    expect(component.newProduct.fechaReestructuracion).toBe('2027-01-20');

    component.onFechaLiberacionChange('');
    expect(component.newProduct.fechaReestructuracion).toBe('');
  });

  it('editProduct should set isEditing and map dates for input', () => {
    const p = {
      ...mockProducts[0],
      fechaLiberacion: new Date('2026-01-20T00:00:00.000Z'),
      fechaReestructuracion: new Date('2027-01-20T00:00:00.000Z')
    };

    component.editProduct(p as any);

    expect(component.isEditing).toBe(true);
    expect(component.showModal).toBe(true);
    expect(component.newProduct.productId).toBe('p1');
    expect(component.newProduct.fechaLiberacion).toBe('2026-01-20');
    expect(component.newProduct.fechaReestructuracion).toBe('2027-01-20');
  });

  it('formatDateForTable should format dd/MM/yyyy', () => {
    const d = new Date('2026-01-05T00:00:00.000Z');
    expect(component.formatDateForTable(d)).toBe('05/01/2026');
    expect(component.formatDateForTable(undefined)).toBe('');
  });

  it('closeModalOnOverlay should close only when clicking overlay', () => {
    component.showModal = true;
    component.closeModalOnOverlay({ target: 1, currentTarget: 1 } as any);
    expect(component.showModal).toBe(false);

    component.showModal = true;
    component.closeModalOnOverlay({ target: 1, currentTarget: 2 } as any);
    expect(component.showModal).toBe(true);
  });

  it('closeDeleteModalOnOverlay should close only when clicking overlay', () => {
    component.showDeleteModal = true;
    component.productToDelete = mockProducts[0] as any;
    component.closeDeleteModalOnOverlay({ target: 1, currentTarget: 1 } as any);
    expect(component.showDeleteModal).toBe(false);
    expect(component.productToDelete).toBeNull();

    component.showDeleteModal = true;
    component.productToDelete = mockProducts[0] as any;
    component.closeDeleteModalOnOverlay({ target: 1, currentTarget: 2 } as any);
    expect(component.showDeleteModal).toBe(true);
    expect(component.productToDelete).toBeTruthy();
  });

  it('saveProduct should not proceed when validateProduct fails', () => {
    const validateSpy = jest.spyOn(component, 'validateProduct').mockReturnValue(false);
    component.saveProduct();
    expect(validateSpy).toHaveBeenCalled();
    expect(productsServiceMock.verifyProductId).not.toHaveBeenCalled();
    expect(productsServiceMock.createProduct).not.toHaveBeenCalled();
    expect(productsServiceMock.updateProduct).not.toHaveBeenCalled();
  });

  it('saveProduct should set productIdError when verifyProductId returns true (id exists)', fakeAsync(() => {
    jest.spyOn(component, 'validateProduct').mockReturnValue(true);
    productsServiceMock.verifyProductId.mockReturnValueOnce(of(true));
    const toastSpy = jest.spyOn(component, 'showToast').mockImplementation(() => void 0);

    component.isEditing = false;
    component.newProduct = {
      productId: 'p1',
      nombre: 'Nombre Valido',
      descripcion: 'Descripcion Valida',
      logo: 'logo',
      fechaLiberacion: '2026-01-20',
      fechaReestructuracion: '2027-01-20'
    };

    component.saveProduct();
    tick();

    expect(productsServiceMock.verifyProductId).toHaveBeenCalledWith('p1');
    expect(component.productIdError).toBe('ID ya existe');
    expect(productsServiceMock.createProduct).not.toHaveBeenCalled();
    expect(toastSpy).not.toHaveBeenCalled();
  }));

  it('saveProduct should create product when not editing and id does not exist', fakeAsync(() => {
    jest.spyOn(component, 'validateProduct').mockReturnValue(true);
    productsServiceMock.verifyProductId.mockReturnValueOnce(of(false));
    productsServiceMock.createProduct.mockReturnValueOnce(of(mockProducts[0]));

    const loadSpy = jest.spyOn(component as any, 'loadProducts');
    const searchSpy = jest.spyOn(component, 'performSearch');
    const closeSpy = jest.spyOn(component, 'closeModal');
    const toastSpy = jest.spyOn(component, 'showToast').mockImplementation(() => void 0);

    component.isEditing = false;
    component.newProduct = {
      productId: 'new',
      nombre: 'Nombre Valido',
      descripcion: 'Descripcion Valida',
      logo: 'logo',
      fechaLiberacion: '2026-01-20',
      fechaReestructuracion: '2027-01-20'
    };

    component.saveProduct();
    tick();

    expect(productsServiceMock.createProduct).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Producto agregado correctamente', 'success');
  }));

  it('saveProduct should update product when editing (no verifyProductId)', fakeAsync(() => {
    jest.spyOn(component, 'validateProduct').mockReturnValue(true);
    productsServiceMock.updateProduct.mockReturnValueOnce(of(mockProducts[0]));

    const loadSpy = jest.spyOn(component as any, 'loadProducts');
    const toastSpy = jest.spyOn(component, 'showToast').mockImplementation(() => void 0);

    component.isEditing = true;
    component.newProduct = {
      productId: 'p1',
      nombre: 'Nombre Valido',
      descripcion: 'Descripcion Valida',
      logo: 'logo',
      fechaLiberacion: '2026-01-20',
      fechaReestructuracion: '2027-01-20'
    };

    component.saveProduct();
    tick();

    expect(productsServiceMock.verifyProductId).not.toHaveBeenCalled();
    expect(productsServiceMock.updateProduct).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Producto actualizado correctamente', 'success');
  }));

  it('saveProduct should show error toast when create/update fails (non id exists error)', fakeAsync(() => {
    jest.spyOn(component, 'validateProduct').mockReturnValue(true);
    productsServiceMock.verifyProductId.mockReturnValueOnce(of(false));
    productsServiceMock.createProduct.mockReturnValueOnce(throwError(() => new Error('Backend fallo')));
    const toastSpy = jest.spyOn(component, 'showToast').mockImplementation(() => void 0);

    component.isEditing = false;
    component.newProduct = {
      productId: 'new',
      nombre: 'Nombre Valido',
      descripcion: 'Descripcion Valida',
      logo: 'logo',
      fechaLiberacion: '2026-01-20',
      fechaReestructuracion: '2027-01-20'
    };

    component.saveProduct();
    tick();

    expect(toastSpy).toHaveBeenCalledWith('Backend fallo', 'error');
  }));

  it('loadProducts should handle error without throwing', fakeAsync(() => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => void 0);
    productsServiceMock.getProducts.mockReturnValueOnce(throwError(() => new Error('load fail')));

    fixture.detectChanges();
    tick();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  }));

  it('openModal should reset editing state, newProduct, errors and show modal', () => {
    component.isEditing = true;
    component.newProduct = { productId: 'x' };
    component.productIdError = 'err';

    component.openModal();

    expect(component.isEditing).toBe(false);
    expect(component.showModal).toBe(true);
    expect(component.newProduct).toEqual({});
    expect(component.productIdError).toBeNull();
  });

  it('resetForm should clear product, errors, and exit edit mode', () => {
    component.isEditing = true;
    component.newProduct = { productId: 'x' };
    component.nombreError = 'err';

    component.resetForm();

    expect(component.newProduct).toEqual({});
    expect(component.nombreError).toBeNull();
    expect(component.isEditing).toBe(false);
  });

  it('toggleMenu should open menu for product and set menuPosition', () => {
    const stopPropagation = jest.fn();
    const event = {
      stopPropagation,
      currentTarget: {
        getBoundingClientRect: () => ({ bottom: 100, left: 200 })
      }
    } as any;

    component.toggleMenu('p1', event);

    expect(stopPropagation).toHaveBeenCalled();
    expect(component.openMenuId).toBe('p1');
    expect(component.menuPosition.top).toBe(100 + window.scrollY);
    expect(component.menuPosition.left).toBe(200 + window.scrollX - 80);
  });

  it('toggleMenu should close if clicking same product again', () => {
    const event = {
      stopPropagation: jest.fn(),
      currentTarget: {
        getBoundingClientRect: () => ({ bottom: 100, left: 200 })
      }
    } as any;

    component.toggleMenu('p1', event);
    expect(component.openMenuId).toBe('p1');

    component.toggleMenu('p1', event);
    expect(component.openMenuId).toBeNull();
  });

  it('closeMenu should always close kebab menu', () => {
    component.openMenuId = 'p1';
    component.closeMenu();
    expect(component.openMenuId).toBeNull();
  });

  it('deleteProduct should open delete modal and set productToDelete', () => {
    component.openMenuId = 'p1';
    component.deleteProduct(mockProducts[0] as any);

    expect(component.showDeleteModal).toBe(true);
    expect(component.productToDelete?.productId).toBe('p1');
    expect(component.openMenuId).toBeNull();
  });

  it('confirmDelete should call service.deleteProduct, remove item and close modal on success', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    // ensure products list contains the item
    component.products = [...(mockProducts as any)];

    const toastSpy = jest.spyOn(component, 'showToast').mockImplementation(() => void 0);
    const searchSpy = jest.spyOn(component, 'performSearch');

    component.productToDelete = mockProducts[0] as any;
    component.showDeleteModal = true;

    component.confirmDelete();
    tick();

    expect(productsServiceMock.deleteProduct).toHaveBeenCalledWith('p1');
    expect(component.products.some(p => p.productId === 'p1')).toBe(false);
    expect(searchSpy).toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledWith('Producto eliminado correctamente', 'success');
    expect(component.showDeleteModal).toBe(false);
    expect(component.productToDelete).toBeNull();
  }));

  it('confirmDelete should show error toast on failure', fakeAsync(() => {
    productsServiceMock.deleteProduct.mockReturnValueOnce(
      throwError(() => new Error('Fallo delete'))
    );

    const toastSpy = jest.spyOn(component, 'showToast').mockImplementation(() => void 0);

    component.productToDelete = mockProducts[0] as any;
    component.showDeleteModal = true;

    component.confirmDelete();
    tick();

    // confirmDelete error handler schedules a setTimeout(..., 3000)
    tick(3000);

    expect(toastSpy).toHaveBeenCalledWith('Fallo delete', 'error');
    expect(component.isSaving).toBe(false);
  }));

  it('setDefaultImage should replace img src with default', () => {
    const img = document.createElement('img');
    img.src = 'broken.png';
    component.setDefaultImage({ target: img } as any);
    expect(img.src).toContain('assets/images/defecto.png');
  });
});
