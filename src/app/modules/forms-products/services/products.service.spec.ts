import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductsService } from './products.service';
import { Product, ProductApi } from './Vo/product.model';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  const API_URL = '/bp/products';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService]
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProducts should GET and map ProductApi[] to Product[]', (done) => {
    const apiProducts: ProductApi[] = [
      {
        id: 'p1',
        name: 'Producto 1',
        description: 'Desc 1',
        logo: 'logo1',
        date_release: '2026-01-20T00:00:00.000Z',
        date_revision: '2027-01-20T00:00:00.000Z'
      }
    ];

    service.getProducts().subscribe({
      next: (products) => {
        expect(products.length).toBe(1);
        expect(products[0].productId).toBe('p1');
        expect(products[0].nombre).toBe('Producto 1');
        expect(products[0].descripcion).toBe('Desc 1');
        expect(products[0].logo).toBe('logo1');
        expect(products[0].fechaLiberacion instanceof Date).toBe(true);
        expect(products[0].fechaReestructuracion instanceof Date).toBe(true);
        // Mapeo en UTC (día/mes/año)
        expect(products[0].fechaLiberacion.toISOString().startsWith('2026-01-20')).toBe(true);
        expect(products[0].fechaReestructuracion.toISOString().startsWith('2027-01-20')).toBe(true);
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ data: apiProducts });
  });

  it('verifyProductId should GET boolean', (done) => {
    service.verifyProductId('abc').subscribe({
      next: (exists) => {
        expect(exists).toBe(true);
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne(`${API_URL}/verification/abc`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('verifyProductId should throw mapped error message when backend fails', (done) => {
    service.verifyProductId('abc').subscribe({
      next: () => done.fail('Expected error'),
      error: (err: Error) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Error al verificar el ID');
        done();
      }
    });

    const req = httpMock.expectOne(`${API_URL}/verification/abc`);
    expect(req.request.method).toBe('GET');
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('createProduct should POST and map response.data to Product', (done) => {
    const product: Product = {
      productId: 'p1',
      nombre: 'Prod',
      descripcion: 'Descripcion',
      logo: 'logo',
      fechaLiberacion: new Date('2026-01-20T00:00:00.000Z'),
      fechaReestructuracion: new Date('2027-01-20T00:00:00.000Z')
    };

    const apiResponse: ProductApi = {
      id: 'p1',
      name: 'Prod',
      description: 'Descripcion',
      logo: 'logo',
      date_release: '2026-01-20T00:00:00.000Z',
      date_revision: '2027-01-20T00:00:00.000Z'
    };

    service.createProduct(product).subscribe({
      next: (created) => {
        expect(created.productId).toBe('p1');
        expect(created.nombre).toBe('Prod');
        expect(created.descripcion).toBe('Descripcion');
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      id: 'p1',
      name: 'Prod',
      description: 'Descripcion',
      logo: 'logo',
      date_release: new Date(product.fechaLiberacion).toISOString(),
      date_revision: new Date(product.fechaReestructuracion).toISOString()
    });

    req.flush({ message: 'ok', data: apiResponse });
  });

  it('createProduct should throw mapped error message when backend fails', (done) => {
    const product: Product = {
      productId: 'p1',
      nombre: 'Prod',
      descripcion: 'Descripcion',
      logo: 'logo',
      fechaLiberacion: new Date('2026-01-20T00:00:00.000Z'),
      fechaReestructuracion: new Date('2027-01-20T00:00:00.000Z')
    };

    service.createProduct(product).subscribe({
      next: () => done.fail('Expected error'),
      error: (err: Error) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Error al guardar producto');
        done();
      }
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('updateProduct should PUT and map response.data to Product', (done) => {
    const product: Product = {
      productId: 'p1',
      nombre: 'Prod',
      descripcion: 'Descripcion',
      logo: 'logo',
      fechaLiberacion: new Date('2026-01-20T00:00:00.000Z'),
      fechaReestructuracion: new Date('2027-01-20T00:00:00.000Z')
    };

    const apiResponse: ProductApi = {
      id: 'p1',
      name: 'Prod2',
      description: 'Descripcion2',
      logo: 'logo2',
      date_release: '2026-01-20T00:00:00.000Z',
      date_revision: '2027-01-20T00:00:00.000Z'
    };

    service.updateProduct(product).subscribe({
      next: (updated) => {
        expect(updated.productId).toBe('p1');
        expect(updated.nombre).toBe('Prod2');
        expect(updated.descripcion).toBe('Descripcion2');
        expect(updated.logo).toBe('logo2');
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne(`${API_URL}/p1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      name: 'Prod',
      description: 'Descripcion',
      logo: 'logo',
      date_release: new Date(product.fechaLiberacion).toISOString(),
      date_revision: new Date(product.fechaReestructuracion).toISOString()
    });

    req.flush({ message: 'ok', data: apiResponse });
  });

  it('updateProduct should throw mapped error message when backend fails', (done) => {
    const product: Product = {
      productId: 'p1',
      nombre: 'Prod',
      descripcion: 'Descripcion',
      logo: 'logo',
      fechaLiberacion: new Date('2026-01-20T00:00:00.000Z'),
      fechaReestructuracion: new Date('2027-01-20T00:00:00.000Z')
    };

    service.updateProduct(product).subscribe({
      next: () => done.fail('Expected error'),
      error: (err: Error) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Error al actualizar el producto');
        done();
      }
    });

    const req = httpMock.expectOne(`${API_URL}/p1`);
    expect(req.request.method).toBe('PUT');
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('deleteProduct should DELETE and return void', (done) => {
    service.deleteProduct('p1').subscribe({
      next: (res) => {
        expect(res).toBeUndefined();
        done();
      },
      error: done.fail
    });

    const req = httpMock.expectOne(`${API_URL}/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });

  it('deleteProduct should throw mapped error message when backend fails', (done) => {
    service.deleteProduct('p1').subscribe({
      next: () => done.fail('Expected error'),
      error: (err: Error) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Error al eliminar el producto');
        done();
      }
    });

    const req = httpMock.expectOne(`${API_URL}/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 404, statusText: 'Not Found' });
  });
});
