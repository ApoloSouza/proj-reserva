import { Router } from 'express';
import ReservaController from '../Controllers/ReservaController.js';

const router = Router();

// Define as rotas para o recurso 'reserva'
router.get('/reservas', ReservaController.index);
router.get('/reservas/:id', ReservaController.show);
router.post('/reservas', ReservaController.store);
router.put('/reservas/:id', ReservaController.update);
router.delete('/reservas/:id', ReservaController.destroy);

export default router;
