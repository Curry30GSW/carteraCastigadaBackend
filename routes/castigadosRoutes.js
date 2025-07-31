const express = require('express');
const router = express.Router();
const castigadosController = require('../controllers/castigadosController');
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/castigados', authenticateToken, castigadosController.getCastigosAll);

router.get('/castigos/:cedula', authenticateToken, castigadosController.getCastigoPorCedula);

router.get('/estado-proceso/:cuenta', authenticateToken, castigadosController.getEstadoProceso);

router.get('/castigos/gestion/:cuenta', authenticateToken, castigadosController.getGestionProceso);

router.get('/resumen-agencias', authenticateToken, castigadosController.getResumenAgencias);

router.get('/por-agencia/:codigoAgencia', authenticateToken, castigadosController.getCastigosPorAgencia);


module.exports = router;