export interface ProductApi {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface Product {
  productId: string;
  nombre: string;
  descripcion: string;
  logo: string;
  fechaLiberacion: Date;
  fechaReestructuracion: Date;
}

// Nuevo tipo para actualizar
export type ProductApiUpdate = Omit<ProductApi, 'id'>;
