const castigadosModel = require('../models/castigadosModel');

const getCastigosAll = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;

        const result = await castigadosModel.getCastigosAll(page, pageSize);

        // Aplicar trim a los strings si es necesario
        const trimmedData = result.data.map(row => {
            const trimmedRow = {};
            for (const key in row) {
                trimmedRow[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
            }
            return trimmedRow;
        });

        res.status(200).json({
            data: trimmedData,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error en castigadosController.getCastigosAll:', error);
        res.status(500).json({
            message: 'Error al obtener los castigos',
            error: error.message
        });
    }
};

const getCastigoPorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;

        if (!cedula) {
            return res.status(400).json({ message: 'La cédula es requerida' });
        }

        const result = await castigadosModel.getCastigoPorCedula(cedula);

        const trimmedData = result.map(row => {
            const trimmedRow = {};
            for (const key in row) {
                trimmedRow[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
            }
            return trimmedRow;
        });

        res.status(200).json(trimmedData);
    } catch (error) {
        console.error('Error en castigadosController.getCastigoPorCedula:', error);
        res.status(500).json({
            message: 'Error al obtener el castigo por cédula',
            error: error.message
        });
    }
};

const getEstadoProceso = async (req, res) => {
    try {
        const { cuenta } = req.params;

        if (!cuenta) {
            return res.status(400).json({
                success: false,
                message: 'El número de cuenta (cuenta) es requerido'
            });
        }

        const result = await castigadosModel.getEstadoProceso(cuenta);

        const trimmedData = result.map(row => {
            const trimmedRow = {};
            for (const key in row) {
                trimmedRow[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
            }
            return trimmedRow;
        });

        if (!trimmedData || trimmedData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró información del proceso para la cuenta proporcionada'
            });
        }

        res.status(200).json({
            success: true,
            data: trimmedData
        });

    } catch (error) {
        console.error('Error en castigadosController.getEstadoProceso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el estado del proceso',
            error: error.message
        });
    }
};


const getGestionProceso = async (req, res) => {
    try {
        const { cuenta } = req.params;

        if (!cuenta) {
            return res.status(400).json({ message: 'El número de cuenta (cuenta) es requerido' });
        }

        const result = await castigadosModel.getGestionProceso(cuenta);

        const trimmedData = result.map(row => {
            const trimmedRow = {};
            for (const key in row) {
                trimmedRow[key] = typeof row[key] === 'string'
                    ? row[key].trim().replace(/\s+/g, ' ')
                    : row[key];
            }
            return trimmedRow;
        });

        if (trimmedData.length === 0) {
            return res.status(404).json({
                message: 'No se encontraron gestiones para la cuenta proporcionada'
            });
        }

        res.status(200).json(trimmedData);
    } catch (error) {
        console.error('Error en castigadosController.getGestionProceso:', error);
        res.status(500).json({
            message: 'Error al obtener las gestiones del proceso',
            error: error.message
        });
    }
};

const getResumenAgencias = async (req, res) => {
    try {
        const data = await castigadosModel.getResumenAgencias();

        const dataConTrim = data.map(item => ({
            ...item,
            NOMBRE_AGENCIA: item.NOMBRE_AGENCIA ? item.NOMBRE_AGENCIA.trim() : ''
        }));


        res.json({
            success: true,
            data: dataConTrim,
            message: 'Resumen de agencias obtenido correctamente'
        });
    } catch (error) {
        console.error('Error en castigosController.getResumenAgencias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el resumen de agencias',
            error: error.message
        });
    }
};


const getCastigosPorAgencia = async (req, res) => {
    try {
        const { codigoAgencia } = req.params;

        if (!codigoAgencia) {
            return res.status(400).json({
                success: false,
                message: 'El código de agencia es requerido'
            });
        }

        const data = await castigadosModel.getCastigosPorAgencia(codigoAgencia);

        const trimmedData = data.map(row => {
            const trimmedRow = {};
            for (const key in row) {
                trimmedRow[key] = typeof row[key] === 'string'
                    ? row[key].trim().replace(/\s+/g, ' ')
                    : row[key];
            }
            return trimmedRow;
        });

        res.json({
            success: true,
            data: trimmedData,
            count: trimmedData.length,
            message: 'Cuentas en castigo obtenidas correctamente'
        });
    } catch (error) {
        console.error('Error en castigosController.getCastigosPorAgencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas en castigo',
            error: error.message
        });
    }
};


module.exports = {
    getCastigosAll,
    getCastigoPorCedula,
    getEstadoProceso,
    getGestionProceso,
    getResumenAgencias,
    getCastigosPorAgencia
};