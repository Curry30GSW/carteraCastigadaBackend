const db = require('../config/db');

const castigosModel = {
    getCastigosAll: async (page = 1, pageSize = 10) => {
        try {
            page = Math.max(1, parseInt(page));
            pageSize = Math.min(Math.max(1, parseInt(pageSize)), 2700);

            const offset = (page - 1) * pageSize;

            const result = await db.executeQuery(`
                SELECT
                    ACP03.DIRE03, ACP93.DIST93, ACP054.MAIL05, ACP93.AAUX93, ACP93.NCTA93, ACP93.NNIT93,
                    ACP93.DCTA93, ACP93.ESCR93, ACP93.ORCR93, ACP93.DDEP93, ACP93.DEPE93, ACP05.AUXA05,
                    ACP05.FTAG05, ACP93.DNOM93, ACP05.DIRE05, ACP03.DESC03, ACP05.TELE05, ACP054.TCEL05,
                    ACP03.DIRO03, ACP03.TELS03
                FROM COLIB.ACP93 ACP93
                JOIN COLIB.ACP03 ACP03 ON ACP03.DIST03 = ACP93.AAUX93
                JOIN COLIB.ACP05 ACP05 ON ACP05.NCTA05 = ACP93.NCTA93 AND ACP05.DIST05 = 0
                JOIN COLIB.ACP054 ACP054 ON ACP054.NCTA05 = ACP05.NCTA05
                WHERE (ACP93.ESCR93 + ACP93.ORCR93) > 0
                ORDER BY ACP93.NCTA93
                LIMIT ? OFFSET ?`, [pageSize, offset]);

            const totalResult = await db.executeQuery(`
                SELECT COUNT(DISTINCT ACP93.NCTA93) as total 
                FROM COLIB.ACP93 ACP93
                JOIN COLIB.ACP03 ACP03 ON ACP03.DIST03 = ACP93.AAUX93
                JOIN COLIB.ACP05 ACP05 ON ACP05.NCTA05 = ACP93.NCTA93 AND ACP05.DIST05 = 0
                JOIN COLIB.ACP054 ACP054 ON ACP054.NCTA05 = ACP05.NCTA05
                LEFT JOIN COLIB.ACP053 ACP053 ON ACP93.NNIT93 = ACP053.NIT053
                WHERE (ACP93.ESCR93 + ACP93.ORCR93) > 0`);

            const total = totalResult[0]?.TOTAL || 0;
            const totalPages = Math.ceil(total / pageSize);

            return {
                data: result,
                pagination: {
                    total,
                    page,
                    pageSize,
                    totalPages,
                    min: 1,
                    max: totalPages
                }
            };
        } catch (error) {
            console.error('Error en castigosModel.getCastigosAll:', error);
            throw error;
        }
    },

    getCastigoPorCedula: async (cedula) => {
        try {
            const result = await db.executeQuery(`
        SELECT
            ACP03.DIRE03, ACP93.DIST93, ACP054.MAIL05, ACP93.AAUX93, ACP93.NCTA93, ACP93.NNIT93,
            ACP93.DCTA93, ACP93.ESCR93, ACP93.ORCR93, ACP93.DDEP93, ACP93.DEPE93, ACP05.AUXA05,
            ACP05.FTAG05, ACP93.DNOM93, ACP05.DIRE05, ACP03.DESC03, ACP05.TELE05, ACP05.LNAC05, 
            ACP05.FECN05, ACP05.CARG05, ACP05.ESTC05, ACP054.TCEL05, ACP03.DIRO03, ACP03.TELS03, 
            ACP05.FRIP05,
            ACP053.NOM531, ACP053.APE531, ACP053.DIR531, ACP053.CIU531, ACP053.TRE531,
            ACP053.TOF531, ACP053.TCE531, ACP053.TRF531, ACP053.NOM532, ACP053.APE532,
            ACP053.DIR532, ACP053.CIU532, ACP053.TRF532,
            ACP053.NOM533, ACP053.APE533, ACP053.DIR533, ACP053.CIU533,
            ACP053.TRE533, ACP053.TOF533, ACP053.TCE533, ACP053.TRF533,
            ACP051.BEN105, ACP051.NIT105, ACP051.CEL105, ACP051.PAR105, 
            ACP051.BEN205, ACP051.NIT205, ACP051.CEL205, ACP051.PAR205, 
            ACP051.BEN305, ACP051.NIT305, ACP051.CEL305, ACP051.PAR305,
            (
                SELECT LISTAGG(
                    'CREDITO:' || RTRIM(ACP13.NCRE13) || 
                    '|TCRE:' || TRIM(CHAR(ACP13.TCRE13)) ||
                    '|MOGA:' || TRIM(CHAR(ACP13.MOGA13)) ||
                    '|SCAP:' || TRIM(CHAR(ACP13.SCAP13)) || 
                    '|SINT:' || TRIM(CHAR(ACP13.SINT13)) || 
                    '|SIMO:' || TRIM(CHAR(ACP13.SIMO13)) || 
                    '|SICO:' || TRIM(CHAR(ACP13.SICO13)) || 
                    '|SCJO:' || TRIM(CHAR(ACP13.SCJO13)),
                    '#'
                ) WITHIN GROUP (ORDER BY ACP13.NCRE13)
                FROM COLIB.ACP13 ACP13
                WHERE ACP13.NCTA13 = ACP93.NCTA93 AND ACP13.SCAP13 > 0
            ) AS CREDITOS_AGRUPADOS,
            -- Totales sumarizados
            (
                SELECT SUM(SCAP13) FROM COLIB.ACP13 WHERE NCTA13 = ACP93.NCTA93 AND SCAP13 > 0
            ) AS TOTAL_SCAP,
            (
                SELECT SUM(SINT13) FROM COLIB.ACP13 WHERE NCTA13 = ACP93.NCTA93 AND SCAP13 > 0
            ) AS TOTAL_SINT,
            (
                SELECT SUM(SIMO13) FROM COLIB.ACP13 WHERE NCTA13 = ACP93.NCTA93 AND SCAP13 > 0
            ) AS TOTAL_SIMO,
            (
                SELECT SUM(SICO13) FROM COLIB.ACP13 WHERE NCTA13 = ACP93.NCTA93 AND SCAP13 > 0
            ) AS TOTAL_SICO
        FROM COLIB.ACP93 ACP93
        JOIN COLIB.ACP03 ACP03 ON ACP03.DIST03 = ACP93.AAUX93
        JOIN COLIB.ACP05 ACP05 ON ACP05.NCTA05 = ACP93.NCTA93 AND ACP05.DIST05 = 0
        JOIN COLIB.ACP054 ACP054 ON ACP054.NCTA05 = ACP05.NCTA05
        LEFT JOIN COLIB.ACP051 ACP051 ON ACP93.NCTA93 = ACP051.NCTA05
        LEFT JOIN COLIB.ACP053 ACP053 ON ACP93.NNIT93 = ACP053.NIT053
        WHERE ACP93.NNIT93 = ? AND (ACP93.ESCR93 + ACP93.ORCR93) > 0
        ORDER BY ACP93.NCTA93
        `, [cedula]);

            // Procesar los resultados para estructurar los créditos
            const processedData = result.map(row => {
                const creditos = [];

                if (row.CREDITOS_AGRUPADOS) {
                    const creditosArray = row.CREDITOS_AGRUPADOS.split('#');
                    creditosArray.forEach(creditoStr => {
                        if (creditoStr.trim()) {
                            const partes = creditoStr.split('|');
                            const credito = {
                                numero: partes[0].replace('CREDITO:', '').trim(),
                                tipo_credito: parseFloat(partes[1].replace('TCRE:', '').trim()),
                                moga: parseFloat(partes[2].replace('MOGA:', '').trim()),
                                saldo_capital: parseFloat(partes[3].replace('SCAP:', '').trim()),
                                interes: parseFloat(partes[4].replace('SINT:', '').trim()),
                                interes_mora: parseFloat(partes[5].replace('SIMO:', '').trim()),
                                interes_contingente: parseFloat(partes[6].replace('SICO:', '').trim()),
                                scjo: parseFloat(partes[7].replace('SCJO:', '').trim())
                            };
                            creditos.push(credito);
                        }
                    });
                }

                return {
                    ...row,
                    creditos: creditos,
                    totales: {
                        saldo_capital: row.TOTAL_SCAP,
                        interes: row.TOTAL_SINT,
                        interes_mora: row.TOTAL_SIMO,
                        interes_contingente: row.TOTAL_SICO
                    }
                };
            });

            return processedData;
        } catch (error) {
            console.error('Error en castigosModel.getCastigoPorCedula:', error);
            throw error;
        }
    },

    getEstadoProceso: async (cuenta) => {
        try {
            const result = await db.executeQuery(`
        SELECT 
            ACP29J.NCTA29,
            ACP29J.FCHA29,
            ACP29J.EXPEJUZ29,
            ACP29J.EXPEINT29,
            ACP29J.ESTADO29,
            ACP29J.FRAD29,
            ACP29J.JUZG29,
            ACP29JJ.DEJ129,
            ACP29J.AGENCIA29,
            ACP29J.CRED29,
            ACP29J.JUZGH29,
            ACP29J.CABO29,
            ABOGADOS.NOM,
            ABOGADOS.APE1,
            ABOGADOS.APE2,
            ABOGADOS.ZONA,
            ESTADOSJ.ES_DESCR,
            ACP29J.INDS29,
            ACP29J.INDL29,
            ACP29J.DMPO29,
            ACP29JD3.DESD29,
            ACP29JD3.DDEP29,
            ACP05.DESC05,
            ACP05.NNIT05,
            ACP03.DESC03,
            (ACP93.ESCR93 + ACP93.ORCR93) AS VALOR_VENCIDO,

            (
                SELECT LISTAGG(
                    RTRIM(ME.ME_MEDIDA) || ' - ' || RTRIM(E.DESE29) ||
                    ' | OBS: ' || COALESCE(ME.ME_OBSERVA, '') ||
                    ' | FEC: ' || CHAR(ME.ME_FECMED) ||
                    ' | USR: ' || RTRIM(ME.ME_USERMO),
                    CHR(10)
                ) WITHIN GROUP (ORDER BY ME.ME_MEDIDA)
                FROM COLIB.MEDIDAS ME
                JOIN COLIB.ACP29JE E ON ME.ME_MEDIDA = E.CEMB29
                WHERE ME.ME_CUENTA = ACP29J.NCTA29
            ) AS MEDIDAS_DETALLE

        FROM 
            COLIB.ACP29J       ACP29J
        JOIN COLIB.ACP29JJ     ACP29JJ  ON ACP29J.JUZG29 = ACP29JJ.CJUZ29
        JOIN COLIB.ACP03       ACP03    ON ACP29J.AGENCIA29 = ACP03.DIST03
        JOIN COLIB.ABOGADOS    ABOGADOS ON ACP29J.CABO29 = ABOGADOS.NUIP
        JOIN COLIB.ESTADOSJ    ESTADOSJ ON ACP29J.ESTADO29 = ESTADOSJ.ES_ESTADO
        JOIN COLIB.ACP29JD3    ACP29JD3 ON ACP29J.DMPO29 = ACP29JD3.DEMP29
        JOIN COLIB.ACP05       ACP05    ON ACP29J.NCTA29 = ACP05.NCTA05
        JOIN COLIB.ACP93       ACP93    ON ACP29J.NCTA29 = ACP93.NCTA93

        WHERE 
            ACP29J.NCTA29 = ?`, [cuenta]);

            return result;
        } catch (error) {
            console.error('Error en castigosModel.getEstadoProceso:', error);
            throw error;
        }
    },

    getGestionProceso: async (cuenta) => {
        try {
            const result = await db.executeQuery(`
            SELECT 
                ACP29.NCTA29, 
                ACP29.GESTION, 
                ACP29.FCHA29, 
                ACP29.HORA29,
                ACP29.USER29,
                ACP29.PUSE29,
                ACP05.DESC05
            FROM COLIB.ACP29 ACP29, COLIB.ACP05 ACP05
            WHERE ACP29.NCTA29 = ACP05.NCTA05
            AND ACP29.NCTA29 = ?
            ORDER BY ACP29.FCHA29 DESC, ACP29.HORA29 DESC
        `, [cuenta]);

            return result;
        } catch (error) {
            console.error('Error en castigosModel.getGestionProceso:', error);
            throw error;
        }
    },


    getResumenAgencias: async () => {
        try {
            const result = await db.executeQuery(`
                SELECT 
                    ACP93.AAUX93 AS CODIGO_AGENCIA,
                    ACP03.DESC03 AS NOMBRE_AGENCIA,
                    COUNT(ACP93.NCTA93) AS TOTAL_CUENTAS,
                    SUM(ACP93.ESCR93 + ACP93.ORCR93) AS TOTAL_DEUDA
                FROM COLIB.ACP93 ACP93
                JOIN COLIB.ACP05 ACP05 ON ACP05.NCTA05 = ACP93.NCTA93 AND ACP05.DIST05 = 0
                JOIN COLIB.ACP054 ACP054 ON ACP054.NCTA05 = ACP05.NCTA05
                JOIN COLIB.ACP03 ACP03 ON ACP03.DIST03 = ACP93.AAUX93
                WHERE (ACP93.ESCR93 + ACP93.ORCR93) > 0
                AND ACP93.AAUX93 IN (
                    13, 29, 30, 31, 32, 33, 34, 35, 36, 37,
                    38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
                    48, 68, 70, 74, 77, 78, 80, 81, 82, 83,
                    84, 85, 86, 87, 88, 89, 90, 91, 92, 93,
                    94, 95, 96, 97, 98
                )
                GROUP BY ACP93.AAUX93, ACP03.DESC03
                ORDER BY ACP93.AAUX93
            `);

            return result;
        } catch (error) {
            console.error('Error en castigosModel.getResumenAgencias:', error);
            throw error;
        }
    },

    getCastigosPorAgencia: async (codigoAgencia) => {
        try {
            if (isNaN(codigoAgencia)) {
                throw new Error('El código de agencia debe ser un número');
            }

            const result = await db.executeQuery(`
                SELECT
                    ACP03.DIRE03, ACP93.DIST93, ACP054.MAIL05, ACP93.AAUX93,
                    ACP93.NCTA93,ACP93.NNIT93,ACP93.DCTA93,ACP93.ESCR93,
                    ACP93.ORCR93, (ACP93.ESCR93 + ACP93.ORCR93) AS SALDO_TOTAL,
                    ACP93.DEPE93,ACP05.AUXA05,ACP05.FTAG05,ACP93.DNOM93,
                    ACP03.DESC03
                FROM COLIB.ACP93 ACP93
                JOIN COLIB.ACP03 ACP03 ON ACP03.DIST03 = ACP93.AAUX93
                JOIN COLIB.ACP05 ACP05 ON ACP05.NCTA05 = ACP93.NCTA93 AND ACP05.DIST05 = 0
                JOIN COLIB.ACP054 ACP054 ON ACP054.NCTA05 = ACP05.NCTA05
                WHERE (ACP93.ESCR93 + ACP93.ORCR93) > 0
                  AND ACP93.AAUX93 = ?
                ORDER BY ACP93.DNOM93 ASC
            `, [codigoAgencia]);

            return result;
        } catch (error) {
            console.error('Error en castigosModel.getCastigosPorAgencia:', error);
            throw error;
        }
    },
};

module.exports = castigosModel;

