# Cinema Website 🎥

Este es un proyecto de un sitio web de cine que permite a los usuarios ver películas, próximos estrenos y promociones, además de gestionar combos y horarios.

## Requisitos 📋

- **Node.js** (versión 16 o superior)
- **PostgreSQL** (versión 12 o superior)

## Instalación 🚀

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/FrancoGPU/Proyecto.git
cd cinema-website
```

### 2. Instalar dependencias
Ejecuta el siguiente comando para instalar las dependencias del proyecto:
```bash
npm install
```

### 3. Configurar la base de datos
1. Crea una base de datos en PostgreSQL llamada `gocine`:
   ```sql
   CREATE DATABASE gocine;
   ```
2. Restaura el archivo `gocine.sql` en la base de datos:
   ```bash
   psql -U postgres -d gocine -f gocine.sql
   ```

### 4. Configurar variables de entorno
1. Copia el archivo `.env-example` y renómbralo a `.env`:
   ```bash
   cp .env-example .env
   ```
2. Edita el archivo `.env` con las credenciales de tu base de datos:
   ```
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña
   DB_HOST=localhost
   DB_NAME=gocine
   DB_PORT=5432
   ```

### 5. Iniciar el servidor
Ejecuta el siguiente comando para iniciar el servidor:
```bash
node server.js
```

El servidor estará disponible en: [http://localhost:3000](http://localhost:3000)

### 6. Acceder a la Aplicación
Una vez que el servidor esté corriendo, abre tu navegador web y ve a la siguiente dirección para acceder a la página principal de GOCINE:
```
http://localhost:3000
```
También puedes acceder a otras páginas específicas como:
*   Panel de Administración (requiere inicio de sesión como admin): `http://localhost:3000/paginas/Administracion/admin.html`
*   Iniciar Sesión: `http://localhost:3000/paginas/Autenticacion/login.html`
*   Registro: `http://localhost:3000/paginas/Autenticacion/registro.html`

## Estructura del Proyecto 📂

```
cinema-website/
├── db.js                  # Configuración de la base de datos
├── server.js              # Servidor principal
├── gocine.sql             # Archivo SQL para restaurar la base de datos
├── .env-example           # Ejemplo de archivo de configuración de entorno
├── package.json           # Dependencias y configuración del proyecto
├── src/
│   ├── css/               # Archivos de estilos
│   ├── js/                # Archivos JavaScript
│   ├── paginas/           # Páginas HTML
│   └── components/        # Componentes reutilizables
```

## Dependencias 📦

- **express**: Framework para el servidor.
- **pg**: Cliente de PostgreSQL para Node.js.
- **dotenv**: Manejo de variables de entorno.

## Contribución 🤝

Si deseas contribuir al proyecto, sigue estos pasos:
1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`).
3. Haz commit de tus cambios (`git commit -m 'Agregada nueva funcionalidad'`).
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia 📄

Este proyecto está bajo la licencia ISC. Consulta el archivo `LICENSE` para más detalles.

## Autor ✒️

Creado por **FrancoGPU**. Si tienes preguntas, no dudes en abrir un issue en el repositorio.

---
¡Gracias por usar este proyecto! 🎬