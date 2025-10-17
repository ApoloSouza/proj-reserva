const express = require('express');
const cors = require('cors');

// **CORREÇÃO:** Esta linha importa o unificador de rotas e define a variável 'routes'.
// O caminho './routes' funciona porque o 'index.js' dentro dele é carregado por padrão.
const routes = require('./routes'); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// A linha abaixo agora funciona, pois a variável 'routes' foi definida acima.
// Todas as suas rotas usarão o prefixo /api
app.use('/api', routes);

module.exports = app;
