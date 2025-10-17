const { Router } = require('express');
const hospedeRoutes = require('./HospedeRoutes.js');
const reservaRoutes = require('./ReservaRoutes.js');

const router = Router();

// Usa os arquivos de rotas específicos
router.use(hospedeRoutes);
router.use(reservaRoutes);

module.exports = router;



