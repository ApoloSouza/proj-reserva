import { Router } from 'express';
import HospedeController from '../Controllers/HospedeController.js';

const router = Router();

// Define as rotas para o recurso 'hospede'
router.get('/api/hospedes', HospedeController.index);
router.get('/api/hospedes/:id', HospedeController.show);
router.post('/api/hospedes', HospedeController.store);
router.put('/api/hospedes/:id', HospedeController.update);
router.delete('/api/hospedes/:id', HospedeController.destroy);

export default router;