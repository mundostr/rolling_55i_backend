<p align="left"><a href="https://rollingcodeschool.com/" target="blank"><img src="https://github.com/mundostr/rolling_55i_backend/raw/master/fullstack-portada.png" width="75%" alt="RollingCode" /></a></p>

# ROLLINGCODE SCHOOL
## Comisión 55i Fullstack 2023
### Repo proyecto backend general Express API Rest para pruebas en clase

### Nuestra API hasta ahora
- basada en Express
- CORS habilitado
- Variables de entorno y parámetros de URL habilitados
- Rutas de usuario y tarjetas en archivos separados con prefijos
- Catchall para rutas inexistentes
- Conexión con MongoDB vía Mongoose
- Paginación de resultados en de usuarios con mongoose-paginate-v2

### Funcionalidades habilitadas
#### Usuarios (users):
- Listado completo
- Listado paginado
- Listado por ID (validación de ID)
- Carga de usuario (validación de requeridos y ya registrado)
- Login de usuario (validación de requerido y existente)
- Login de usuario: generación de token JWT
- Edición de usuario (validación de ID y permitidos)
- Borrado de usuario (validación de ID)
- Endpoint protegido USER (requiere token)
- Endpoint protegido ADMIN (requiere token y rol admin)

#### Tarjetas (gitfcards):
- Listado completo
- Listado por ID (validación de ID)
- Carga de tarjeta (validación de requeridos)
- Edición de tarjeta (validación de ID y permitidos)
- Borrado de tarjeta (validación de ID)

### Dependencias
```bash
$ npm i bcrypt cors dotenv express express-validator mongoose mongoose-paginate-v2
$ npm i nodemon --save-dev
```

### Ejemplo variables de entorno (archivo .env en raíz del proyecto)
```bash
EXPRESS_PORT=5000
MONGODB_URI=mongodb://localhost:27017/rolling55i
MONGODB_URI_REMOTA=mongodb+srv://<usuario>:<clave>@cluster0.4qaobt3.mongodb.net/rolling55i
REQ_LIMIT=30
TOKEN_SECRET=rolling55i
TOKEN_EXPIRATION=1h
```

### Ejecución para desarrollo
```bash
$ npm run dev
```


### Pruebas de endpoints
- Programa externo: [Postman](https://www.postman.com/downloads/)
- Extensión VSCode: [Thunderclient](https://www.thunderclient.com/)


### Generador datos fake
- Datos mock: [Mockaroo](https://www.mockaroo.com/)