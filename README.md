# Aplicación de Productos Financieros

## Descripción
Esta aplicación permite visualizar, buscar, agregar, editar y eliminar productos financieros de un banco mediante una interfaz web y consumo de servicios REST locales.

## 🛠️ Herramientas y tecnologías utilizadas

- **Framework:** Angular 17 (Angular 14 o superior)
- **Lenguaje:** TypeScript 5.4 (TypeScript 4.8 o superior)
- **Testing:** Pruebas unitarias con Jest
- **Control de versiones:** Git
- **Repositorio:** GitHub (público)

---

## Funcionalidades

### F1. Listado de productos financieros
- Muestra todos los productos financieros obtenidos desde la API.

### F2. Búsqueda de productos financieros
- Permite buscar productos mediante un campo de texto.

### F3. Cantidad de registros
- Muestra la cantidad de resultados en pantalla.
- Permite seleccionar cuántos registros mostrar (5, 10, 20) mediante un select.

### F4. Agregar producto
- Botón **Agregar** que navega al formulario de registro.
- Formulario con botones **Agregar** y **Reiniciar**.
- Validaciones de campos:
  - **Id:** requerido, 3-10 caracteres, único (verificación vía servicio).
  - **Nombre:** requerido, 5-100 caracteres.
  - **Descripción:** requerido, 10-200 caracteres.
  - **Logo:** requerido.
  - **Fecha de Liberación:** requerido, >= fecha actual.
  - **Fecha de Revisión:** requerido, exactamente un año posterior a la fecha de liberación.

### F5. Editar producto
- Menú contextual (dropdown) por producto con opción **Editar**.
- Al hacer clic, navega a la pantalla de edición:

### F6. Eliminar producto
- Opción **Eliminar** en el menú contextual de cada producto.
- Modal de confirmación:
  - Botón **Eliminar:** procede con la eliminación.
  - Botón **Cancelar:** oculta el modal.

---

## Servicios API

**URL Base:** `http://localhost:3002`

---

### 1. Obtener productos financieros
- **URL:** `/bp/products`  
- **Método:** `GET`  
- **Ejemplo de respuesta:**
```json
{
  "data": [
    {
      "id": "uno",
      "name": "Nombre producto",
      "description": "Descripción producto",
      "logo": "assets-1.png",
      "date_release": "2025-01-01",
      "date_revision": "2025-01-01"
    }
  ]
}
```

### 2. Crear producto financiero
- **URL:** `/bp/products`  
- **Método:** `POST`
- Body de ejemplo:
```json
{
  "id": "dos",
  "name": "Nombre producto",
  "description": "Descripción producto",
  "logo": "assets-1.png",
  "date_release": "2025-01-01",
  "date_revision": "2025-01-01"
}
```
- **Ejemplo de respuesta:**
```json
{
  "message": "Product added successfully",
  "data": {
    "id": "dos",
    "name": "Nombre producto",
    "description": "Descripción producto",
    "logo": "assets-1.png",
    "date_release": "2025-01-01",
    "date_revision": "2025-01-01"
  }
}
```

### 3. Actualizar producto financiero
- **URL:** `/bp/products/:id`  
- **Método:** `PUT`  
- Body de ejemplo:
```json
{
  "name": "Nombre actualizado",
  "description": "Descripción producto",
  "logo": "assets-1.png",
  "date_release": "2025-01-01",
  "date_revision": "2025-01-01"
}
```
- **Ejemplo de respuesta:**
```json
{
  "message": "Product updated successfully",
  "data": {
    "name": "Nombre actualizado",
    "description": "Descripción producto",
    "logo": "assets-1.png",
    "date_release": "2025-01-01",
    "date_revision": "2025-01-01"
  }
}
```

### 4. Eliminar producto financiero
- **URL:** `/bp/products/:id`  
- **Método:** `DELETE`  
- **Ejemplo de respuesta:**
```json
{
  "message": "Product removed successfully"
}
```


