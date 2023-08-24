<p align="left"><a href="https://rollingcodeschool.com/" target="blank"><img src="https://github.com/mundostr/rolling_55i_backend/raw/master/fullstack-portada.png" width="75%" alt="RollingCode" /></a></p>

# ROLLINGCODE SCHOOL
## Comisión 55i Fullstack 2023
### Repo proyecto backend general Express API Rest para pruebas en clase


### Dependencias
```bash
$ npm i bcrypt cors dotenv express express-validator mongoose mongoose-paginate-v2
$ npm i nodemon --save-dev
```

### Ejemplo variables de entorno (archivo .env en raíz del proyecto)
```bash
EXPRESS_PORT=5000
MONGODB_URI=mongodb://localhost:27017/rolling55i
REQ_LIMIT=50
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