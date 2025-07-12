# Sistema de Registro de Compras - GOCINE

## Descripción
El sistema de registro de compras permite almacenar todas las transacciones realizadas en la aplicación, incluyendo información detallada sobre las compras VIP con descuentos aplicados.

## Componentes Implementados

### 1. Base de Datos
- **Tabla**: `purchases`
- **Ubicación**: `/workspaces/Proyecto/purchases-table.sql`
- **Campos principales**:
  - `id`: ID único autogenerado
  - `user_id`: ID del usuario (nullable para compras de invitados)
  - `movie_title`: Título de la película
  - `showtime`: Horario de la función
  - `selected_seats`: Asientos seleccionados
  - `ticket_price`: Precio de las entradas
  - `cart_items`: Items del carrito (JSON)
  - `total_original`: Total sin descuentos
  - `total_final`: Total con descuentos aplicados
  - `discount_applied`: Porcentaje de descuento VIP
  - `is_vip_purchase`: Indica si es compra VIP
  - `payment_method`: Método de pago
  - `card_last_four`: Últimos 4 dígitos de tarjeta
  - `purchase_date`: Fecha de compra
  - `purchase_id`: ID único de compra generado por la app

### 2. Backend (Controlador)
- **Archivo**: `/workspaces/Proyecto/src/controllers/purchaseController.js`
- **Métodos**:
  - `createPurchase()`: Registra una nueva compra
  - `getUserPurchases()`: Obtiene historial de un usuario
  - `getPurchaseStats()`: Estadísticas para administradores

### 3. Rutas API
- **POST** `/api/purchases`: Registrar compra
- **GET** `/api/purchases/history`: Historial del usuario
- **GET** `/api/admin/purchases/stats`: Estadísticas (admin)

### 4. Frontend
- **Archivo modificado**: `/workspaces/Proyecto/src/js/paginas/Reserva/confirmacion.js`
- **Funcionalidad**: 
  - Envía datos de compra al backend al procesar pago
  - Genera ID único de compra
  - Maneja errores graciosamente
  - Guarda información en localStorage para la boleta

- **Archivo modificado**: `/workspaces/Proyecto/src/js/paginas/Reserva/boleta.js`
- **Funcionalidad**:
  - Usa el ID de compra registrado
  - Muestra fecha de compra real

## Flujo de Compra

1. **Usuario completa formulario de pago** en confirmación
2. **Frontend valida** datos del formulario
3. **Frontend genera** ID único de compra
4. **Frontend envía** datos al endpoint `/api/purchases`
5. **Backend registra** compra en base de datos
6. **Frontend guarda** ID y fecha en localStorage
7. **Usuario es redirigido** a la boleta
8. **Boleta usa** datos registrados para mostrar información

## Datos Registrados

### Información básica:
- Título de película y horario
- Asientos seleccionados
- Precio de entradas

### Información del carrito:
- Combos y productos adicionales
- Precios originales y con descuento

### Información VIP:
- Estado VIP del usuario
- Porcentaje de descuento aplicado
- Totales antes y después del descuento

### Información de pago:
- Método de pago (tarjeta de crédito)
- Últimos 4 dígitos de la tarjeta
- Fecha y hora de la transacción

## Manejo de Errores

- **Error de conexión**: La compra continúa con ID generado localmente
- **Error del servidor**: Se genera ID de respaldo y continúa el flujo
- **ID duplicado**: El backend retorna error 409, frontend maneja graciosamente

## Beneficios

1. **Trazabilidad completa** de todas las transacciones
2. **Análisis de descuentos VIP** aplicados
3. **Estadísticas de ventas** para administradores
4. **Historial personalizado** por usuario
5. **Respaldo de información** para generación de boletas
6. **Manejo robusto de errores** sin interrumpir la experiencia del usuario

## Uso por Administradores

Los administradores pueden acceder a:
- Estadísticas de compras de los últimos 30 días
- Lista de compras recientes
- Información sobre descuentos VIP aplicados
- Total de ingresos y número de clientes únicos

## Consideraciones de Seguridad

- Solo se almacenan los últimos 4 dígitos de la tarjeta
- Los datos de pago sensibles no se guardan
- Validación en backend y frontend
- Control de acceso por roles (admin vs usuario)

## Mantenimiento

- La tabla incluye índices para consultas eficientes
- Comentarios en SQL para documentar el esquema
- Logs en servidor para debugging
- Estructura extensible para futuras funcionalidades
