# Aplicación de Productos Financieros

## Descripción
Esta aplicación permite visualizar, buscar, agregar, editar y eliminar productos financieros de un banco mediante una interfaz web y consumo de servicios REST locales.  
La maquetación y diseño siguen los lineamientos de los diseños **D1**, **D2**, **D3** y **D4**.

---

## Funcionalidades

### F1. Listado de productos financieros
- Muestra todos los productos financieros obtenidos desde la API.
- Maquetación basada en el diseño **D1**.

### F2. Búsqueda de productos financieros
- Permite buscar productos mediante un campo de texto.
- Interfaz basada en el diseño **D1**.

### F3. Cantidad de registros
- Muestra la cantidad de resultados en pantalla.
- Permite seleccionar cuántos registros mostrar (5, 10, 20) mediante un select.
- Maquetación según diseño **D1**.

### F4. Agregar producto
- Botón “Agregar” que navega al formulario de registro.
- Formulario con botones **Agregar** y **Reiniciar**.
- Validaciones de campos:
  - **Id:** requerido, 3-10 caracteres, único (verificación vía servicio).
  - **Nombre:** requerido, 5-100 caracteres.
  - **Descripción:** requerido, 10-200 caracteres.
  - **Logo:** requerido.
  - **Fecha de Liberación:** requerido, >= fecha actual.
  - **Fecha de Revisión:** requerido, exactamente un año posterior a la fecha de liberación.
- Maquetación:
  - Formulario base: **D2**
  - Botón principal: **D3**
- Errores se muestran visualmente por campo si no cumplen las validaciones.

### F5. Editar producto
- Menú contextual (dropdown) por producto con opción **Editar**.
- Al hacer clic, navega a la pantalla de edición:
  - Campo **ID** deshabilitado.
  - Mismas validaciones que en F4.
  - Maquetación del formulario: **D2**
  - Maquetación del menú: **D3**

### F6. Eliminar producto
- Opción **Eliminar** en el menú contextual de cada producto.
- Modal de confirmación:
  - Botón **Eliminar:** procede con la eliminación.
  - Botón **Cancelar:** oculta el modal.
- Maquetación:
  - Menú: **D3**
  - Modal: **D4**

---

## Estructura del Producto Financiero

| Clave           | Tipo   | Ejemplo                                          | Descripción                                               |
|-----------------|--------|-------------------------------------------------|-----------------------------------------------------------|
| `id`            | String | trj-crd                                         | Identificador único del producto                          |
| `name`          | String | Tarjetas de Crédito                             | Nombre del producto                                       |
| `description`   | String | Tarjeta de consumo bajo la modalidad de crédito | Descripción del producto                                  |
| `logo`          | String | https://www.visa.com.ec/dam/.../visa-signature-400x225.jpg | URL de un logo representativo del producto |
| `date_release`  | Date   | 2023-02-01                                      | Fecha de liberación del producto                          |
| `date_revision` | Date   | 2024-02-01                                      | Fecha de revisión del producto                             |

---

## Servicios API

- **URL Base:** `http://localhost:3002`

### Obtener productos financieros
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
Crear producto financiero
URL: /bp/products

Método: POST

Body de ejemplo:

{
  "id": "dos",
  "name": "Nombre producto",
  "description": "Descripción producto",
  "logo": "assets-1.png",
  "date_release": "2025-01-01",
  "date_revision": "2025-01-01"
}
Respuesta exitosa (200):

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
Actualizar producto financiero
URL: /bp/products/:id

Método: PUT

Body de ejemplo:

{
  "name": "Nombre actualizado",
  "description": "Descripción producto",
  "logo": "assets-1.png",
  "date_release": "2025-01-01",
  "date_revision": "2025-01-01"
}
Respuesta exitosa (200):

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
Eliminar producto financiero
URL: /bp/products/:id

Método: DELETE

Respuesta exitosa (200):

{
  "message": "Product removed successfully"
}
Verificación de existencia de ID
URL: /bp/products/verification/:id

Método: GET

Respuesta: true si existe, false si no.